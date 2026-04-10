{
  title: "Process Unity",

  connection: {
    fields: [
      {
        name: 'service_name',
        optional: false,
        hint: 'Enter your Service Name for authentication.'
      },
      {
        name: 'service_password',
        control_type: 'password',
        optional: false,
        hint: 'Enter your Service Password for authentication.'
      },
      {
        name: 'pu_username',
        optional: false,
        hint: 'Enter your Process Unity Username for authentication.'
      },
      {
        name: 'pu_password',
        control_type: 'password',
        optional: false,
        hint: 'Enter your Process Unity Password for authentication.'
      },
      {
        name: 'base_url',
        optional: false,
        hint: 'Enter your Process Unity tenant URL, e.g. https://app.processunity.net/ocean'
      }
    ],

    authorization: {
      type: 'custom_auth',

      acquire: lambda do |connection|
        response = post("#{connection['base_url']}/token").
          payload(
            grant_type: 'password',
            username: connection['service_name'],
            password: connection['service_password'],
            processunityUserName: connection['pu_username'],
            processunityPassword: connection['pu_password']
          ).
          request_format_www_form_urlencoded
        {
          access_token: response['access_token']
        }
      end,

      detect_on: [401],

      refresh_on: [401],

      apply: lambda do |connection|
        headers("Authorization": "Bearer #{connection['access_token']}")
      end
    },

    base_uri: lambda do |connection|
      "#{connection['base_url']}/"
    end
  },

  test: lambda do |_connection|
    get('api/dataexchange/ExportableReports')
      .after_error_response(401) do |_code, body, _header, message|
        error("#{message}: #{body}")
      end
  end,

  custom_action: true,

  custom_action_help: {
    body: "<p>Build your own Process Unity action with a HTTP request. " \
          "The request will be authorized with your Process Unity connection.</p>"
  },

  # ---------------------------------------------------------------------------
  # Object Definitions
  # ---------------------------------------------------------------------------
  object_definitions: {
    report: {
      fields: lambda do |_connection, _config_fields|
        [
          { name: 'Id', type: 'integer' },
          { name: 'Name' },
          { name: 'ExternalId' }
        ]
      end
    },

    import_template: {
      fields: lambda do |_connection, _config_fields|
        [
          { name: 'Id', type: 'integer' },
          { name: 'Name' },
          { name: 'Inserts', type: 'boolean' },
          { name: 'Updates', type: 'boolean' },
          { name: 'ImportType' },
          { name: 'KeyColumn' },
          { name: 'ParentKeyColumn' },
          { name: 'Columns', type: 'array', of: 'string' },
          { name: 'ExternalId' }
        ]
      end
    },

    import_result: {
      fields: lambda do |_connection, _config_fields|
        [
          { name: 'TotalRecords', type: 'integer' },
          { name: 'TotalReadyRecords', type: 'integer' },
          { name: 'TotalErrorRecords', type: 'integer' },
          { name: 'TotalInsertRecords', type: 'integer' },
          { name: 'TotalUpdateRecords', type: 'integer' },
          { name: 'TotalDeleteRecords', type: 'integer' },
          { name: 'TotalNoActionRecords', type: 'integer' }
        ]
      end
    },

    import_with_results_response: {
      fields: lambda do |_connection, _config_fields|
        [
          { name: 'Import', type: 'object' },
          { name: 'Results', type: 'object' },
          { name: 'Complete', type: 'boolean' },
          { name: 'Errors', type: 'boolean' }
        ]
      end
    },

    column_info: {
      fields: lambda do |_connection, _config_fields|
        [
          { name: 'Name' },
          { name: 'ExternalID' },
          { name: 'Description' },
          { name: 'SuppressResults', type: 'boolean' },
          { name: 'GuidSets', type: 'array', of: 'string' },
          { name: 'ReportColumnColumns', type: 'array', of: 'string' }
        ]
      end
    },

    attached_file: {
      fields: lambda do |_connection, _config_fields|
        [
          { name: 'Content', hint: 'Base64 encoded file content' },
          { name: 'ContentLength', type: 'integer', hint: 'Size in bytes' },
          { name: 'FileName' },
          { name: 'Description' }
        ]
      end
    }
  },

  # ---------------------------------------------------------------------------
  # Actions
  # ---------------------------------------------------------------------------
  actions: {
    # === Reports ===

    list_exportable_reports: {
      title: 'List Exportable Reports',
      subtitle: 'List local reports available for data export',
      description: "List <span class='provider'>exportable reports</span> " \
                   "in <span class='provider'>Process Unity</span>",
      help: 'Returns all local reports that can be used with the Export Data action.',

      input_fields: lambda do
        []
      end,

      execute: lambda do |_connection, _input|
        response = get('api/dataexchange/ExportableReports')
          .after_error_response(401) do |_code, body, _header, message|
            error("#{message}: #{body}")
          end
        { reports: response['Data'] }
      end,

      output_fields: lambda do |object_definitions|
        [
          {
            name: 'reports',
            type: 'array',
            of: 'object',
            properties: object_definitions['report']
          }
        ]
      end,

      sample_output: lambda do |_connection, _input|
        { reports: [{ Id: 1, Name: 'Sample Report', ExternalId: 'ext-1' }] }
      end
    },

    list_remote_exportable_reports: {
      title: 'List Remote Exportable Reports',
      subtitle: 'List federated/remote reports available for data export',
      description: "List <span class='provider'>remote exportable reports</span> " \
                   "in <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        []
      end,

      execute: lambda do |_connection, _input|
        response = get('api/dataexchange/RemoteExportableReports')
          .after_error_response(401) do |_code, body, _header, message|
            error("#{message}: #{body}")
          end
        { reports: response['Data'] }
      end,

      output_fields: lambda do |object_definitions|
        [
          {
            name: 'reports',
            type: 'array',
            of: 'object',
            properties: object_definitions['report']
          }
        ]
      end
    },

    list_importable_templates: {
      title: 'List Importable Templates',
      subtitle: 'List local import templates',
      description: "List <span class='provider'>importable templates</span> " \
                   "in <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        []
      end,

      execute: lambda do |_connection, _input|
        response = get('api/dataexchange/ImportableTemplates')
          .after_error_response(401) do |_code, body, _header, message|
            error("#{message}: #{body}")
          end
        { templates: response['Data'] }
      end,

      output_fields: lambda do |object_definitions|
        [
          {
            name: 'templates',
            type: 'array',
            of: 'object',
            properties: object_definitions['import_template']
          }
        ]
      end
    },

    list_remote_importable_templates: {
      title: 'List Remote Importable Templates',
      subtitle: 'List federated/remote import templates',
      description: "List <span class='provider'>remote importable templates</span> " \
                   "in <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        []
      end,

      execute: lambda do |_connection, _input|
        response = get('api/dataexchange/RemoteImportableTemplates')
          .after_error_response(401) do |_code, body, _header, message|
            error("#{message}: #{body}")
          end
        { templates: response['Data'] }
      end,

      output_fields: lambda do |object_definitions|
        [
          {
            name: 'templates',
            type: 'array',
            of: 'object',
            properties: object_definitions['import_template']
          }
        ]
      end
    },

    # === Import / Export ===

    export_data: {
      title: 'Export Data from Report',
      subtitle: 'Export records from a Process Unity report with optional filters',
      description: "Export <span class='provider'>data</span> from a report " \
                   "in <span class='provider'>Process Unity</span>",
      help: 'Exports all records from a report. Optionally filter by column values. ' \
            'Select a report first to see available output fields.',

      config_fields: [
        {
          name: 'report_id',
          label: 'Report',
          control_type: 'select',
          pick_list: 'exportable_reports',
          optional: false,
          hint: 'Select the report to export data from'
        }
      ],

      input_fields: lambda do |_object_definitions, _connection, _config_fields|
        [
          {
            name: 'filters',
            label: 'Filters',
            type: 'array',
            of: 'object',
            optional: true,
            sticky: true,
            hint: 'Optional filters to narrow exported data',
            properties: [
              { name: 'ColumnName', optional: false, hint: 'Column name to filter on' },
              {
                name: 'Values',
                type: 'array',
                of: 'string',
                optional: false,
                hint: 'Values to match'
              }
            ]
          }
        ]
      end,

      execute: lambda do |_connection, input|
        body = {}
        if input['filters'].present?
          body['Filters'] = input['filters'].map do |f|
            values = f['Values']
            values = [values] unless values.is_a?(Array)
            { 'ColumnName' => f['ColumnName'], 'Values' => values }
          end
        end

        response = post("api/importexport/Export/#{input['report_id']}")
          .payload(body)
          .after_error_response(401) do |_code, body_raw, _header, message|
            error("#{message}: #{body_raw}")
          end
        { records: response['Data'] }
      end,

      output_fields: lambda do |_object_definitions, _connection, config_fields|
        if config_fields['report_id'].present?
          begin
            response = post("api/importexport/Export/#{config_fields['report_id']}")
              .payload({})
            records = response['Data'] || []
            first = records.first
            if first.present?
              cols = first.map { |k, _v| { name: k } }
              [
                {
                  name: 'records',
                  type: 'array',
                  of: 'object',
                  properties: cols
                }
              ]
            else
              [{ name: 'records', type: 'array', of: 'object' }]
            end
          rescue
            [{ name: 'records', type: 'array', of: 'object' }]
          end
        else
          [{ name: 'records', type: 'array', of: 'object' }]
        end
      end,

      sample_output: lambda do |_connection, _input|
        { records: [{ 'Name' => 'Acme Corp', 'Status' => 'Active' }] }
      end
    },

    import_data: {
      title: 'Import Records',
      subtitle: 'Import records into Process Unity via an import template',
      description: "Import <span class='provider'>records</span> " \
                   "in <span class='provider'>Process Unity</span>",
      help: 'Imports an array of records using a predefined import template.',

      input_fields: lambda do
        [
          {
            name: 'template_id',
            label: 'Template',
            type: 'integer',
            control_type: 'select',
            pick_list: 'importable_templates',
            optional: false,
            hint: 'Select the import template'
          },
          {
            name: 'include_log',
            label: 'Include log?',
            type: 'boolean',
            optional: true,
            default: false,
            sticky: true,
            hint: 'Whether to include a detailed import log'
          },
          {
            name: 'record_id',
            label: 'Record ID',
            type: 'string',
            optional: false,
            sticky: true,
            hint: 'The ProcessUnity record ID to update'
          },
          {
            name: 'record_status',
            label: 'Status',
            type: 'string',
            optional: false,
            sticky: true,
            hint: 'The status to set on the record (e.g. Approve, Reject)'
          }
        ]
      end,

      execute: lambda do |_connection, input|
        records = [{ 'Id' => input['record_id'], 'Status' => input['record_status'] }]
        body = {
          param: { includeLog: input['include_log'] == true ? 'true' : 'false' },
          data: records
        }

        response = post("api/importexport/Import/#{input['template_id']}")
          .payload(body)
          .after_error_response(401) do |_code, body_raw, _header, message|
            error("#{message}: #{body_raw}")
          end
        response['Data']
      end,

      output_fields: lambda do |object_definitions|
        object_definitions['import_result']
      end,

      sample_output: lambda do |_connection, _input|
        {
          TotalRecords: 10,
          TotalReadyRecords: 10,
          TotalErrorRecords: 0,
          TotalInsertRecords: 8,
          TotalUpdateRecords: 2,
          TotalDeleteRecords: 0
        }
      end
    },

    update_record_status: {
      title: 'Update Record Status',
      subtitle: 'Update a single record status via an import template',
      description: "Update <span class='provider'>record status</span> " \
                   "in <span class='provider'>Process Unity</span>",
      help: 'Updates the status of a single record using an import template.',

      input_fields: lambda do
        [
          {
            name: 'template_id',
            label: 'Template',
            type: 'integer',
            control_type: 'select',
            pick_list: 'importable_templates',
            optional: false,
            hint: 'Select the import template'
          },
          {
            name: 'record_id',
            label: 'Record ID',
            type: 'string',
            optional: false,
            sticky: true,
            hint: 'The ProcessUnity record ID to update'
          },
          {
            name: 'record_status',
            label: 'Status',
            type: 'string',
            optional: false,
            sticky: true,
            hint: 'The status to set on the record (e.g. Approve, Reject)'
          }
        ]
      end,

      execute: lambda do |_connection, input|
        records = [{ 'Id' => input['record_id'], 'Status' => input['record_status'] }]
        body = {
          param: { includeLog: 'false' },
          data: records
        }

        response = post("api/importexport/Import/#{input['template_id']}")
          .payload(body)
          .after_error_response(401) do |_code, body_raw, _header, message|
            error("#{message}: #{body_raw}")
          end
        response['Data']
      end,

      output_fields: lambda do |object_definitions|
        object_definitions['import_result']
      end,

      sample_output: lambda do |_connection, _input|
        {
          TotalRecords: 1,
          TotalReadyRecords: 1,
          TotalErrorRecords: 0,
          TotalInsertRecords: 0,
          TotalUpdateRecords: 1,
          TotalDeleteRecords: 0
        }
      end
    },

    import_data_with_results: {
      title: 'Import Records with Results',
      subtitle: 'Import records and get detailed per-row results',
      description: "Import <span class='provider'>records with results</span> " \
                   "in <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        [
          {
            name: 'object_instance_id',
            label: 'Object Instance ID',
            type: 'integer',
            optional: false
          },
          {
            name: 'data',
            label: 'Records',
            type: 'array',
            of: 'object',
            optional: false,
            sticky: true
          },
          {
            name: 'params',
            label: 'Additional params',
            type: 'object',
            optional: true,
            sticky: true
          }
        ]
      end,

      execute: lambda do |_connection, input|
        body = {
          importParamObject: {
            data: input['data'],
            params: input['params'] || {}
          }
        }

        response = post("api/importexport/ImportWithResults/#{input['object_instance_id']}")
          .payload(body)
          .after_error_response(401) do |_code, body_raw, _header, message|
            error("#{message}: #{body_raw}")
          end
        response['Data']
      end,

      output_fields: lambda do |object_definitions|
        object_definitions['import_with_results_response']
      end
    },

    get_columns: {
      title: 'Get Column Metadata',
      subtitle: 'Get column definitions for an object instance',
      description: "Get <span class='provider'>column metadata</span> " \
                   "in <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        [
          {
            name: 'object_instance_id',
            label: 'Object Instance ID',
            type: 'integer',
            optional: false
          }
        ]
      end,

      execute: lambda do |_connection, input|
        response = get("api/importexport/GetColumns/#{input['object_instance_id']}")
          .after_error_response(401) do |_code, body, _header, message|
            error("#{message}: #{body}")
          end
        response['Data']
      end,

      output_fields: lambda do |object_definitions|
        object_definitions['column_info']
      end
    },

    get_report_columns: {
      title: 'Get Report Columns',
      subtitle: 'Get report column metadata for an object instance',
      description: "Get <span class='provider'>report columns</span> " \
                   "in <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        [
          {
            name: 'object_instance_id',
            label: 'Object Instance ID',
            type: 'integer',
            optional: false
          }
        ]
      end,

      execute: lambda do |_connection, input|
        response = get("api/importexport/GetReportColumns/#{input['object_instance_id']}")
          .after_error_response(401) do |_code, body, _header, message|
            error("#{message}: #{body}")
          end
        { columns: response['Data'] }
      end,

      output_fields: lambda do |_object_definitions|
        [
          { name: 'columns', type: 'array', of: 'object' }
        ]
      end
    },

    # === Files ===

    attach_files: {
      title: 'Attach Files',
      subtitle: 'Upload file attachments to a Process Unity object',
      description: "Attach <span class='provider'>files</span> " \
                   "to <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        [
          { name: 'objectId', optional: false },
          {
            name: 'files',
            sticky: true,
            type: 'array',
            of: 'object',
            properties: [
              { name: 'Content', type: 'string', optional: false, sticky: true,
                hint: 'Base64 encoded content of the file' },
              { name: 'ContentLength', type: 'integer', convert_input: 'integer_conversion',
                optional: true, sticky: true, hint: 'Size of the file in bytes' },
              { name: 'FileName', type: 'string', optional: false, sticky: true },
              { name: 'Description', type: 'string', optional: true, sticky: true }
            ]
          }
        ]
      end,

      execute: lambda do |_connection, input|
        response = post("api/v2/AttachedFiles/#{input['objectId']}", input['files'])
        { File_Name: response.first }
      end,

      output_fields: lambda do |_object_definitions|
        [
          { name: 'File_Name' }
        ]
      end
    },

    list_file_names: {
      title: 'List Attached File Names',
      subtitle: 'List file names attached to a Process Unity object',
      description: "List <span class='provider'>file names</span> " \
                   "in <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        [
          {
            name: 'object_id',
            label: 'Object ID',
            type: 'integer',
            optional: false,
            hint: 'ID of the Process Unity object'
          }
        ]
      end,

      execute: lambda do |_connection, input|
        file_names = get("api/v2/AttachedFiles/#{input['object_id']}/FileNames")
        { file_names: file_names }
      end,

      output_fields: lambda do |_object_definitions|
        [
          { name: 'file_names', type: 'array', of: 'string' }
        ]
      end
    },

    get_files: {
      title: 'Download Attached Files',
      subtitle: 'Download file contents attached to a Process Unity object',
      description: "Download <span class='provider'>attached files</span> " \
                   "from <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        [
          {
            name: 'object_id',
            label: 'Object ID',
            type: 'integer',
            optional: false
          },
          {
            name: 'filenames',
            label: 'File name filter',
            type: 'array',
            of: 'string',
            optional: true,
            sticky: true,
            hint: 'Only return files matching these names'
          },
          {
            name: 'zip_content',
            label: 'Zip content?',
            type: 'boolean',
            optional: true,
            sticky: true,
            hint: 'Return file contents as zipped base64'
          }
        ]
      end,

      execute: lambda do |_connection, input|
        params = {}
        params['filenames'] = input['filenames'] if input['filenames'].present?
        params['zipContent'] = input['zip_content'] if input['zip_content'].present?

        files = get("api/v2/AttachedFiles/#{input['object_id']}")
          .params(params)
        { files: files }
      end,

      output_fields: lambda do |object_definitions|
        [
          {
            name: 'files',
            type: 'array',
            of: 'object',
            properties: object_definitions['attached_file']
          }
        ]
      end
    },

    copy_files: {
      title: 'Copy Files Between Objects',
      subtitle: 'Server-side copy of file attachments between Process Unity objects',
      description: "Copy <span class='provider'>files</span> " \
                   "in <span class='provider'>Process Unity</span>",

      input_fields: lambda do
        [
          {
            name: 'source_object_type_id',
            label: 'Source Object Type ID',
            type: 'integer',
            optional: false
          },
          {
            name: 'source_object_id',
            label: 'Source Object ID',
            type: 'integer',
            optional: false
          },
          {
            name: 'target_object_type_id',
            label: 'Target Object Type ID',
            type: 'integer',
            optional: false
          },
          {
            name: 'target_object_id',
            label: 'Target Object ID',
            type: 'integer',
            optional: false
          },
          {
            name: 'file_filters',
            label: 'File name filters',
            type: 'array',
            of: 'string',
            optional: true,
            sticky: true,
            hint: 'Only copy files matching these names'
          },
          {
            name: 'file_sources',
            label: 'File sources',
            type: 'array',
            of: 'string',
            optional: true,
            sticky: true
          }
        ]
      end,

      execute: lambda do |_connection, input|
        body = {
          copyFileRequest: {
            source: {
              objectTypeId: input['source_object_type_id'],
              objectId: input['source_object_id']
            },
            target: {
              objectTypeId: input['target_object_type_id'],
              objectId: input['target_object_id']
            },
            fileFilters: input['file_filters'],
            fileSources: input['file_sources']
          }.compact
        }

        result = post('api/v2/AttachedFiles').payload(body)
        { copied_files: result }
      end,

      output_fields: lambda do |_object_definitions|
        [
          { name: 'copied_files', type: 'array', of: 'string' }
        ]
      end
    }
  },

  # ---------------------------------------------------------------------------
  # Triggers
  # ---------------------------------------------------------------------------
  triggers: {
    new_exported_records: {
      title: 'New Exported Records',
      subtitle: 'Poll a report for new/updated records',
      description: "New <span class='provider'>exported records</span> " \
                   "from <span class='provider'>Process Unity</span>",
      help: 'Polls a Process Unity report on a schedule and returns matching records. ' \
            'Select a report first to see available output fields.',

      config_fields: [
        {
          name: 'report_id',
          label: 'Report',
          control_type: 'select',
          pick_list: 'exportable_reports',
          optional: false,
          hint: 'Select the report to poll'
        }
      ],

      input_fields: lambda do |_object_definitions, _connection, _config_fields|
        [
          {
            name: 'filters',
            label: 'Filters',
            type: 'array',
            of: 'object',
            optional: true,
            sticky: true,
            properties: [
              { name: 'ColumnName', optional: false },
              { name: 'Values', type: 'array', of: 'string', optional: false }
            ]
          }
        ]
      end,

      poll: lambda do |_connection, input, _closure|
        body = {}
        body['Filters'] = input['filters'] if input['filters'].present?

        response = post("api/importexport/Export/#{input['report_id']}")
          .payload(body)

        records = response['Data'] || []

        {
          events: records,
          can_poll_more: false
        }
      end,

      dedup: lambda do |record|
        record.hash
      end,

      output_fields: lambda do |_object_definitions, _connection, config_fields|
        if config_fields['report_id'].present?
          begin
            response = post("api/importexport/Export/#{config_fields['report_id']}")
              .payload({})
            records = response['Data'] || []
            first = records.first
            if first.present?
              first.map { |k, _v| { name: k } }
            else
              []
            end
          rescue => e
            [{ name: 'debug_error', label: "Error: #{e.message}" }]
          end
        else
          []
        end
      end
    }
  },

  # ---------------------------------------------------------------------------
  # Pick Lists
  # ---------------------------------------------------------------------------
  pick_lists: {
    exportable_reports: lambda do |_connection|
      response = get('api/dataexchange/ExportableReports')
      reports = response['Data'] || []
      reports.map { |r| [r['Name'], r['Id']] }
    end,

    importable_templates: lambda do |_connection|
      response = get('api/dataexchange/ImportableTemplates')
      templates = response['Data'] || []
      templates.map { |t| [t['Name'], t['Id']] }
    end
  }
}
