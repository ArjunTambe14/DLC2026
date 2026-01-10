{
  "name": "Review",
  "type": "object",
  "properties": {
    "businessId": {
      "type": "string",
      "description": "ID of the business being reviewed"
    },
    "rating": {
      "type": "number",
      "minimum": 1,
      "maximum": 5,
      "description": "Rating from 1 to 5"
    },
    "reviewText": {
      "type": "string",
      "description": "Review text content"
    },
    "photoUrl": {
      "type": "string",
      "description": "Optional photo URL"
    },
    "userName": {
      "type": "string",
      "description": "Name of reviewer"
    },
    "userEmail": {
      "type": "string",
      "description": "Email of reviewer for duplicate prevention"
    }
  },
  "required": [
    "businessId",
    "rating",
    "reviewText"
  ]
}