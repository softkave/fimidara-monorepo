[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / GetResourcesEndpointResult

# Type Alias: GetResourcesEndpointResult

> **GetResourcesEndpointResult** = `object`

Response containing the requested resources. Each resource is wrapped with metadata for easy identification.

## Example

```json
{
  "resources": [
    {
      "resourceId": "file000_000000000000000000000",
      "resourceType": "file",
      "resource": {
        "__id": "FieldObject",
        "name": "File",
        "description": "File resource with metadata and location information",
        "fields": {
          "resourceId": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldString",
              "description": "Resource ID",
              "example": "wrkspce_000000000000000000000"
            }
          },
          "createdBy": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldObject",
              "name": "Agent",
              "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
              "fields": {
                "agentId": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent ID. Possible agents are users and agent tokens",
                    "example": "user000_000000000000000000000"
                  }
                },
                "agentType": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent type",
                    "example": "agentToken",
                    "valid": [
                      "user",
                      "agentToken"
                    ],
                    "enumName": "AgentType"
                  }
                }
              }
            }
          },
          "createdAt": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldNumber",
              "description": "UTC timestamp in milliseconds",
              "example": 1672531200000
            }
          },
          "lastUpdatedBy": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldObject",
              "name": "Agent",
              "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
              "fields": {
                "agentId": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent ID. Possible agents are users and agent tokens",
                    "example": "user000_000000000000000000000"
                  }
                },
                "agentType": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent type",
                    "example": "agentToken",
                    "valid": [
                      "user",
                      "agentToken"
                    ],
                    "enumName": "AgentType"
                  }
                }
              }
            }
          },
          "lastUpdatedAt": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldNumber",
              "description": "UTC timestamp in milliseconds",
              "example": 1672531200000
            }
          },
          "isDeleted": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldBoolean"
            }
          },
          "deletedAt": {
            "__id": "FieldObjectField",
            "required": false,
            "data": {
              "__id": "FieldNumber",
              "description": "UTC timestamp in milliseconds",
              "example": 1672531200000
            }
          },
          "deletedBy": {
            "__id": "FieldObjectField",
            "required": false,
            "data": {
              "__id": "FieldObject",
              "name": "Agent",
              "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
              "fields": {
                "agentId": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent ID. Possible agents are users and agent tokens",
                    "example": "user000_000000000000000000000"
                  }
                },
                "agentType": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent type",
                    "example": "agentToken",
                    "valid": [
                      "user",
                      "agentToken"
                    ],
                    "enumName": "AgentType"
                  }
                }
              }
            }
          },
          "workspaceId": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldString",
              "description": "Workspace ID",
              "example": "wrkspce_000000000000000000000"
            }
          },
          "size": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldNumber",
              "description": "File size in bytes",
              "max": 1073741824,
              "example": 1024000
            }
          },
          "ext": {
            "__id": "FieldObjectField",
            "required": false,
            "data": {
              "__id": "FieldString",
              "description": "File ext, case insensitive",
              "example": "jpg"
            }
          },
          "parentId": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldOrCombination",
              "description": "Folder ID or null if resource is not in a folder (e.g., at workspace root)",
              "types": [
                {
                  "__id": "FieldString",
                  "description": "Folder ID",
                  "example": "folder0_000000000000000000000"
                },
                {
                  "__id": "FieldNull"
                }
              ]
            }
          },
          "idPath": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldArray",
              "type": {
                "__id": "FieldString",
                "description": "Folder ID",
                "example": "folder0_000000000000000000000"
              },
              "description": "List of parent folder IDs"
            }
          },
          "namepath": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldArray",
              "description": "Folder path as a list of folder names. It should not include the workspace rootname. e.g [\"my-folder\", \"my-sub-folder\"].",
              "type": {
                "__id": "FieldString"
              },
              "example": [
                "my-folder",
                "my-sub-folder"
              ]
            }
          },
          "mimetype": {
            "__id": "FieldObjectField",
            "required": false,
            "data": {
              "__id": "FieldString",
              "description": "File MIME type",
              "example": "image/jpeg"
            }
          },
          "encoding": {
            "__id": "FieldObjectField",
            "required": false,
            "data": {
              "__id": "FieldString",
              "description": "File encoding",
              "example": "utf8"
            }
          },
          "name": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldString",
              "description": "File name, case insensitive",
              "example": "my-file"
            }
          },
          "description": {
            "__id": "FieldObjectField",
            "required": false,
            "data": {
              "__id": "FieldString",
              "description": "Resource description",
              "example": "This is a resource description."
            }
          },
          "version": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldNumber",
              "description": "File version, representing how many times a file has been uploaded",
              "example": 1
            }
          }
        }
      }
    },
    {
      "resourceId": "folder0_000000000000000000000",
      "resourceType": "folder",
      "resource": {
        "__id": "FieldObject",
        "name": "Folder",
        "description": "Represents a folder in the workspace with its metadata and hierarchy information",
        "fields": {
          "resourceId": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldString",
              "description": "Resource ID",
              "example": "wrkspce_000000000000000000000"
            }
          },
          "createdBy": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldObject",
              "name": "Agent",
              "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
              "fields": {
                "agentId": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent ID. Possible agents are users and agent tokens",
                    "example": "user000_000000000000000000000"
                  }
                },
                "agentType": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent type",
                    "example": "agentToken",
                    "valid": [
                      "user",
                      "agentToken"
                    ],
                    "enumName": "AgentType"
                  }
                }
              }
            }
          },
          "createdAt": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldNumber",
              "description": "UTC timestamp in milliseconds",
              "example": 1672531200000
            }
          },
          "lastUpdatedBy": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldObject",
              "name": "Agent",
              "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
              "fields": {
                "agentId": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent ID. Possible agents are users and agent tokens",
                    "example": "user000_000000000000000000000"
                  }
                },
                "agentType": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent type",
                    "example": "agentToken",
                    "valid": [
                      "user",
                      "agentToken"
                    ],
                    "enumName": "AgentType"
                  }
                }
              }
            }
          },
          "lastUpdatedAt": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldNumber",
              "description": "UTC timestamp in milliseconds",
              "example": 1672531200000
            }
          },
          "isDeleted": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldBoolean"
            }
          },
          "deletedAt": {
            "__id": "FieldObjectField",
            "required": false,
            "data": {
              "__id": "FieldNumber",
              "description": "UTC timestamp in milliseconds",
              "example": 1672531200000
            }
          },
          "deletedBy": {
            "__id": "FieldObjectField",
            "required": false,
            "data": {
              "__id": "FieldObject",
              "name": "Agent",
              "description": "Represents a user or system entity that performed an action (e.g., created or updated a resource)",
              "fields": {
                "agentId": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent ID. Possible agents are users and agent tokens",
                    "example": "user000_000000000000000000000"
                  }
                },
                "agentType": {
                  "__id": "FieldObjectField",
                  "required": true,
                  "data": {
                    "__id": "FieldString",
                    "description": "Agent type",
                    "example": "agentToken",
                    "valid": [
                      "user",
                      "agentToken"
                    ],
                    "enumName": "AgentType"
                  }
                }
              }
            }
          },
          "workspaceId": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldString",
              "description": "Workspace ID",
              "example": "wrkspce_000000000000000000000"
            }
          },
          "name": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldString",
              "description": "Resource name",
              "example": "My resource name"
            }
          },
          "description": {
            "__id": "FieldObjectField",
            "required": false,
            "data": {
              "__id": "FieldString",
              "description": "Resource description",
              "example": "This is a resource description."
            }
          },
          "idPath": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldArray",
              "type": {
                "__id": "FieldString",
                "description": "Folder ID",
                "example": "folder0_000000000000000000000"
              },
              "description": "List of parent folder IDs"
            }
          },
          "namepath": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldArray",
              "description": "Folder path as a list of folder names. It should not include the workspace rootname. e.g [\"my-folder\", \"my-sub-folder\"].",
              "type": {
                "__id": "FieldString"
              },
              "example": [
                "my-folder",
                "my-sub-folder"
              ]
            }
          },
          "parentId": {
            "__id": "FieldObjectField",
            "required": true,
            "data": {
              "__id": "FieldOrCombination",
              "description": "Folder ID or null if resource is not in a folder (e.g., at workspace root)",
              "types": [
                {
                  "__id": "FieldString",
                  "description": "Folder ID",
                  "example": "folder0_000000000000000000000"
                },
                {
                  "__id": "FieldNull"
                }
              ]
            }
          }
        }
      }
    }
  ]
}
```

## Properties

### resources

> **resources**: [`ResourceWrapper`](ResourceWrapper.md)[]

Array of resource wrappers containing the requested resources and their metadata.

#### Example

```json
[
  {
    "resourceId": "file000_000000000000000000000",
    "resourceType": "file",
    "resource": {
      "resourceId": "file000_000000000000000000000",
      "createdAt": 1672531200000,
      "lastUpdatedAt": 1672531200000,
      "lastUpdatedBy": {
        "agentId": "agtoken_000000000000000000000",
        "agentType": "agentToken"
      },
      "createdBy": {
        "agentId": "agtoken_000000000000000000000",
        "agentType": "agentToken"
      }
    }
  }
]
```
