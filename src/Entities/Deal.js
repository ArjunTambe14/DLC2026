{
  "name": "Deal",
  "type": "object",
  "properties": {
    "businessId": {
      "type": "string",
      "description": "ID of the business offering the deal"
    },
    "title": {
      "type": "string",
      "description": "Deal title"
    },
    "description": {
      "type": "string",
      "description": "Deal description"
    },
    "startDate": {
      "type": "string",
      "format": "date",
      "description": "Deal start date"
    },
    "endDate": {
      "type": "string",
      "format": "date",
      "description": "Deal end date"
    },
    "couponCode": {
      "type": "string",
      "description": "Coupon code"
    },
    "redemptionInstructions": {
      "type": "string",
      "description": "How to redeem the deal"
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
      "description": "Deal category"
    },
    "viewCount": {
      "type": "number",
      "default": 0,
      "description": "Number of views"
    },
    "saveCount": {
      "type": "number",
      "default": 0,
      "description": "Number of saves"
    }
  },
  "required": [
    "businessId",
    "title",
    "description",
    "endDate"
  ]
}