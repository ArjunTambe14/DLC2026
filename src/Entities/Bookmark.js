{
  "name": "Bookmark",
  "type": "object",
  "properties": {
    "businessId": {
      "type": "string",
      "description": "ID of the bookmarked business"
    },
    "userEmail": {
      "type": "string",
      "description": "Email of the user who bookmarked"
    }
  },
  "required": [
    "businessId",
    "userEmail"
  ]
}