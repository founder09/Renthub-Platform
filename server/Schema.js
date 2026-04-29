const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  title:       Joi.string().required(),
  description: Joi.string().required(),
  location:    Joi.string().required(),
  country:     Joi.string().required(),
  price:       Joi.number().required().min(0),
  image:       Joi.any(),

  // Enum and basic SaaS fields
  listingType: Joi.string().valid('Room', 'PG', 'Flat', 'Hostel', 'Studio').default('Room'),
  nearCollege: Joi.string().allow('', null),
  gender:      Joi.string().valid('Any', 'Male', 'Female').default('Any'),

  // Amenities and Rules (coming as comma-separated strings from FormData)
  amenities:   Joi.string().allow('', null),
  houseRules:  Joi.string().allow('', null),

  // New SaaS numeric details
  bedrooms:    Joi.number().min(0).allow('', null),
  bathrooms:   Joi.number().min(0).allow('', null),
  maxGuests:   Joi.number().min(1).allow('', null),
  floorSize:   Joi.number().min(0).allow('', null),
  securityDeposit: Joi.number().min(0).allow('', null),

  // Dates
  availableFrom: Joi.date().allow('', null),

  // Private Contact Info
  contactName:     Joi.string().allow('', null),
  contactPhone:    Joi.string().allow('', null),
  contactEmail:    Joi.string().email().allow('', null),
  contactWhatsapp: Joi.string().allow('', null),
}).unknown(true); // allow unknown fields just in case

module.exports.reviewSchema = Joi.object({
  rating:  Joi.number().required().min(1).max(5),
  comment: Joi.string().required(),
});
