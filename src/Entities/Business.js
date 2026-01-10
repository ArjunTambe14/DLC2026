{
  "name": "Business",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Business name"
    },
    "category": {
      "type": "string",
      "enum": [
        "food",
        "retail",
        "services",
        "health",
        "entertainment",
        "other"
      ],
      "description": "Business category"
    },
    "address": {
      "type": "string",
      "description": "Street address"
    },
    "city": {
      "type": "string",
      "description": "City"
    },
    "state": {
      "type": "string",
      "description": "State"
    },
    "zip": {
      "type": "string",
      "description": "ZIP code"
    },
    "phone": {
      "type": "string",
      "description": "Phone number"
    },
    "website": {
      "type": "string",
      "description": "Website URL"
    },
    "hours": {
      "type": "string",
      "description": "Business hours"
    },
    "priceLevel": {
      "type": "string",
      "enum": [
        "$",
        "$$",
        "$$$",
        "$$$$"
      ],
      "default": "$$",
      "description": "Price level"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Business tags"
    },
    "description": {
      "type": "string",
      "description": "Business description"
    },
    "verifiedBadge": {
      "type": "boolean",
      "default": false,
      "description": "Verified business badge"
    },
    "imageUrl": {
      "type": "string",
      "description": "Business image URL"
    },
    "averageRating": {
      "type": "number",
      "default": 0,
      "description": "Computed average rating"
    },
    "reviewCount": {
      "type": "number",
      "default": 0,
      "description": "Total review count"
    }
  },
  "required": [
    "name",
    "category",
    "city",
    "state"
  ]
}