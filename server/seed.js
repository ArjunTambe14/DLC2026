import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, initDb, makeId, nowIso } from './db.js';

dotenv.config();
initDb();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@streetpulse.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'StreetPulseAdmin!';

const makeHours = (open, close) => ({
  mon: { open, close },
  tue: { open, close },
  wed: { open, close },
  thu: { open, close },
  fri: { open, close },
  sat: { open: '09:00', close: '17:00' },
  sun: { open: '10:00', close: '14:00' }
});

const businesses = [
  {
    name: 'Harborline Coffee & Bakery',
    category: 'food',
    address: '112 Dockside Ave',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(217) 555-0110',
    website: 'https://harborlinecoffee.example.com',
    hours: 'Mon-Fri 7am-6pm, Sat 9am-5pm, Sun 10am-2pm',
    priceLevel: '$$',
    tags: ['coffee', 'bakery', 'wifi'],
    description: 'Small-batch espresso, house-made pastries, and a sunny window bar for remote work.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('07:00', '18:00'),
    latitude: 39.8017,
    longitude: -89.6436
  },
  {
    name: 'Oak & Willow Bookshop',
    category: 'retail',
    address: '45 Maple Ave',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    phone: '(217) 555-0133',
    website: 'https://oakwillowbooks.example.com',
    hours: 'Daily 10am-7pm',
    priceLevel: '$$',
    tags: ['books', 'events', 'community'],
    description: 'Curated indie reads, weekly author events, and a cozy used-book corner.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('10:00', '19:00'),
    latitude: 39.8062,
    longitude: -89.6504
  },
  {
    name: 'Northside Auto Care',
    category: 'auto',
    address: '800 Route 29',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    phone: '(217) 555-0190',
    website: 'https://northsideauto.example.com',
    hours: 'Mon-Fri 8am-6pm',
    priceLevel: '$$',
    tags: ['oil change', 'brakes', 'inspection'],
    description: 'ASE-certified techs handling tune-ups, brake service, and same-day inspections.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('08:00', '18:00'),
    latitude: 39.7817,
    longitude: -89.6502
  },
  {
    name: 'Bloom & Co. Floral Studio',
    category: 'beauty',
    address: '299 Garden Lane',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    phone: '(217) 555-0177',
    website: 'https://bloomco.example.com',
    hours: 'Mon-Sat 9am-6pm',
    priceLevel: '$$',
    tags: ['flowers', 'weddings', 'gifts'],
    description: 'Modern floral arrangements, event styling, and same-day bouquets.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '18:00'),
    latitude: 39.7904,
    longitude: -89.6378
  },
  {
    name: 'Summit Wellness Clinic',
    category: 'health',
    address: '12 Cedar Medical Plaza',
    city: 'Springfield',
    state: 'IL',
    zip: '62705',
    phone: '(217) 555-0142',
    website: 'https://summitwellness.example.com',
    hours: 'Mon-Fri 8am-5pm',
    priceLevel: '$$$',
    tags: ['primary care', 'labs', 'telehealth'],
    description: 'Family-focused clinic offering same-week appointments and on-site labs.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1504814532849-927f2d056c1e?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('08:00', '17:00'),
    latitude: 39.7756,
    longitude: -89.6754
  },
  {
    name: 'Cedar Grove Hardware',
    category: 'home',
    address: '520 Cedar Grove Rd',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    phone: '(217) 555-0151',
    website: 'https://cedargrovehardware.example.com',
    hours: 'Mon-Sat 8am-7pm, Sun 9am-4pm',
    priceLevel: '$$',
    tags: ['tools', 'paint', 'garden'],
    description: 'Neighborhood hardware with tool rentals and expert project advice.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1484632152040-840235adc262?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('08:00', '19:00'),
    latitude: 39.8151,
    longitude: -89.6491
  },
  {
    name: 'Metro Fit Studio',
    category: 'health',
    address: '710 East Monroe',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(217) 555-0164',
    website: 'https://metrofit.example.com',
    hours: 'Mon-Fri 5am-9pm, Sat 7am-4pm',
    priceLevel: '$$$',
    tags: ['fitness', 'classes', 'personal training'],
    description: 'High-energy HIIT, yoga, and strength classes with certified coaches.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1526401485004-2aa7a21a5b1d?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('05:00', '21:00'),
    latitude: 39.8012,
    longitude: -89.6467
  },
  {
    name: 'Silverline Electronics Repair',
    category: 'services',
    address: '900 Tech Park Dr',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    phone: '(217) 555-0188',
    website: 'https://silverlinefix.example.com',
    hours: 'Mon-Sat 9am-7pm',
    priceLevel: '$$',
    tags: ['phone repair', 'laptop', 'diagnostics'],
    description: 'Same-day device repairs with transparent pricing and warranty.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '19:00'),
    latitude: 39.7859,
    longitude: -89.6365
  },
  {
    name: 'Sunset Theater Co.',
    category: 'entertainment',
    address: '88 Elm Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    phone: '(217) 555-0122',
    website: 'https://sunsettheater.example.com',
    hours: 'Wed-Sun 4pm-10pm',
    priceLevel: '$$',
    tags: ['performing arts', 'tickets', 'community'],
    description: 'Community theater featuring local productions and youth workshops.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('16:00', '22:00'),
    latitude: 39.8129,
    longitude: -89.6524
  },
  {
    name: 'Brightside Nail Lounge',
    category: 'beauty',
    address: '410 Pearl St',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    phone: '(217) 555-0138',
    website: 'https://brightsidenails.example.com',
    hours: 'Mon-Sat 10am-7pm',
    priceLevel: '$$',
    tags: ['nails', 'spa', 'self-care'],
    description: 'Gel manicures, spa pedicures, and relaxing add-on treatments.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1508385082359-f38ae991e8f6?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('10:00', '19:00'),
    latitude: 39.7892,
    longitude: -89.6701
  },
  {
    name: 'Prairie Plate Diner',
    category: 'food',
    address: '200 State St',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(217) 555-0128',
    website: 'https://prairieplate.example.com',
    hours: 'Daily 6am-3pm',
    priceLevel: '$',
    tags: ['breakfast', 'lunch', 'classic'],
    description: 'All-day breakfast, homemade pies, and daily blue-plate specials.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1528502668750-88ba58083c0f?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('06:00', '15:00'),
    latitude: 39.7991,
    longitude: -89.6449
  },
  {
    name: 'Lighthouse Pet Supply',
    category: 'retail',
    address: '930 Harbor Blvd',
    city: 'Springfield',
    state: 'IL',
    zip: '62707',
    phone: '(217) 555-0119',
    website: 'https://lighthousepet.example.com',
    hours: 'Mon-Sat 9am-8pm, Sun 10am-5pm',
    priceLevel: '$$',
    tags: ['pets', 'grooming', 'supplies'],
    description: 'Natural pet foods, locally made treats, and self-serve wash stations.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '20:00'),
    latitude: 39.8261,
    longitude: -89.6114
  },
  {
    name: 'SparkLine Print & Design',
    category: 'services',
    address: '77 Market Sq',
    city: 'Springfield',
    state: 'IL',
    zip: '62706',
    phone: '(217) 555-0195',
    website: 'https://sparklineprint.example.com',
    hours: 'Mon-Fri 8am-6pm',
    priceLevel: '$$',
    tags: ['printing', 'branding', 'design'],
    description: 'Fast business cards, banners, and brand kits with in-house designers.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529336953121-adf5d80f9b37?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('08:00', '18:00'),
    latitude: 39.7998,
    longitude: -89.6637
  },
  {
    name: 'FreshStart Cleaners',
    category: 'services',
    address: '515 Pine St',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    phone: '(217) 555-0172',
    website: 'https://freshstartcleaners.example.com',
    hours: 'Mon-Sat 7am-7pm',
    priceLevel: '$$',
    tags: ['laundry', 'dry cleaning', 'pickup'],
    description: 'Eco-friendly dry cleaning with free pickup and delivery options.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('07:00', '19:00'),
    latitude: 39.7823,
    longitude: -89.6463
  },
  {
    name: 'Bluebird Yoga Loft',
    category: 'health',
    address: '311 Skyview Rd',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    phone: '(217) 555-0182',
    website: 'https://bluebirdyoga.example.com',
    hours: 'Daily 6am-8pm',
    priceLevel: '$$',
    tags: ['yoga', 'wellness', 'meditation'],
    description: 'Vinyasa, restorative, and prenatal classes with small-group instruction.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('06:00', '20:00'),
    latitude: 39.7821,
    longitude: -89.6665
  },
  {
    name: 'Oakridge Bike Works',
    category: 'retail',
    address: '150 Riverfront Dr',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(217) 555-0149',
    website: 'https://oakridgebikes.example.com',
    hours: 'Mon-Sat 9am-6pm',
    priceLevel: '$$',
    tags: ['bikes', 'repairs', 'gear'],
    description: 'Bike sales, rentals, and quick repairs for trail and commuter riders.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1460899960812-f6ee1ecaf117?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '18:00'),
    latitude: 39.8031,
    longitude: -89.6497
  },
  {
    name: 'Riverbend Barber & Co.',
    category: 'beauty',
    address: '66 Riverbend Ave',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    phone: '(217) 555-0144',
    website: 'https://riverbendbarber.example.com',
    hours: 'Mon-Sat 9am-6pm',
    priceLevel: '$$',
    tags: ['barber', 'haircuts', 'grooming'],
    description: 'Classic cuts, hot towel shaves, and online booking in minutes.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501fb?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '18:00'),
    latitude: 39.8111,
    longitude: -89.6412
  },
  {
    name: 'Sunrise Tutoring Lab',
    category: 'services',
    address: '900 College Ave',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    phone: '(217) 555-0179',
    website: 'https://sunrisetutoring.example.com',
    hours: 'Mon-Thu 3pm-8pm, Sat 9am-1pm',
    priceLevel: '$$',
    tags: ['tutoring', 'stem', 'test prep'],
    description: 'Personalized tutoring for math, science, and SAT/ACT prep.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('15:00', '20:00'),
    latitude: 39.7909,
    longitude: -89.6201
  },
  {
    name: 'Evergreen Home Staging',
    category: 'home',
    address: '22 Willow Ct',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    phone: '(217) 555-0186',
    website: 'https://evergreenstaging.example.com',
    hours: 'Mon-Fri 9am-5pm',
    priceLevel: '$$$',
    tags: ['interiors', 'home staging', 'design'],
    description: 'Staging consultations and furniture rentals to help homes sell faster.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '17:00'),
    latitude: 39.7792,
    longitude: -89.6775
  },
  {
    name: 'Prairie Spice Market',
    category: 'retail',
    address: '511 Market Sq',
    city: 'Springfield',
    state: 'IL',
    zip: '62706',
    phone: '(217) 555-0160',
    website: 'https://prairiespice.example.com',
    hours: 'Tue-Sun 10am-6pm',
    priceLevel: '$$',
    tags: ['spices', 'gourmet', 'local'],
    description: 'Globally sourced spices, cooking classes, and recipe kits.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('10:00', '18:00'),
    latitude: 39.7983,
    longitude: -89.6631
  },
  {
    name: 'Cityline Comedy Club',
    category: 'entertainment',
    address: '700 Laugh Ln',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(217) 555-0167',
    website: 'https://citylinecomedy.example.com',
    hours: 'Thu-Sun 6pm-12am',
    priceLevel: '$$',
    tags: ['comedy', 'live shows', 'nightlife'],
    description: 'Local and touring comics with weekend late-night showcases.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1461783436728-0a9217714694?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1523371153586-b3b8e1782b44?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('18:00', '23:30'),
    latitude: 39.8019,
    longitude: -89.6509
  },
  {
    name: 'Juniper Event Rentals',
    category: 'services',
    address: '90 Festival Pkwy',
    city: 'Springfield',
    state: 'IL',
    zip: '62707',
    phone: '(217) 555-0170',
    website: 'https://juniperrentals.example.com',
    hours: 'Mon-Fri 9am-6pm',
    priceLevel: '$$',
    tags: ['events', 'rentals', 'tents'],
    description: 'Chairs, tents, and lighting packages for weddings and corporate events.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '18:00'),
    latitude: 39.8354,
    longitude: -89.6119
  },
  {
    name: 'Westfield Music School',
    category: 'entertainment',
    address: '18 Harmony Rd',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    phone: '(217) 555-0157',
    website: 'https://westfieldmusic.example.com',
    hours: 'Mon-Thu 2pm-8pm, Sat 9am-1pm',
    priceLevel: '$$',
    tags: ['music lessons', 'piano', 'guitar'],
    description: 'Private lessons and ensemble coaching for all ages.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1454922915609-78549ad709bb?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('14:00', '20:00'),
    latitude: 39.8125,
    longitude: -89.6687
  },
  {
    name: 'Edgewood Bike & Auto Wash',
    category: 'auto',
    address: '610 Edgewood Rd',
    city: 'Springfield',
    state: 'IL',
    zip: '62707',
    phone: '(217) 555-0129',
    website: 'https://edgewoodwash.example.com',
    hours: 'Daily 7am-8pm',
    priceLevel: '$',
    tags: ['car wash', 'detailing', 'memberships'],
    description: 'Express tunnel wash plus interior detailing packages.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('07:00', '20:00'),
    latitude: 39.8391,
    longitude: -89.6063
  },
  {
    name: 'Mason & Maple Furniture',
    category: 'home',
    address: '38 Artisan Way',
    city: 'Springfield',
    state: 'IL',
    zip: '62706',
    phone: '(217) 555-0136',
    website: 'https://masonmaple.example.com',
    hours: 'Mon-Sat 10am-6pm',
    priceLevel: '$$$',
    tags: ['furniture', 'handmade', 'custom'],
    description: 'Custom hardwood tables and locally crafted home decor.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('10:00', '18:00'),
    latitude: 39.7992,
    longitude: -89.6626
  },
  {
    name: 'GlowDerm Skin Studio',
    category: 'beauty',
    address: '205 Radiance Blvd',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    phone: '(217) 555-0169',
    website: 'https://glowderm.example.com',
    hours: 'Tue-Sat 9am-6pm',
    priceLevel: '$$$',
    tags: ['skin care', 'facials', 'spa'],
    description: 'Clinical facials, peels, and personalized skin health plans.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1508385082359-f38ae991e8f6?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '18:00'),
    latitude: 39.7801,
    longitude: -89.6734
  },
  {
    name: 'Urban Harvest Co-op',
    category: 'food',
    address: '17 Market St',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(217) 555-0107',
    website: 'https://urbanharvest.example.com',
    hours: 'Daily 8am-8pm',
    priceLevel: '$$',
    tags: ['groceries', 'local', 'organic'],
    description: 'Member-owned grocery featuring local produce and bulk goods.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('08:00', '20:00'),
    latitude: 39.8003,
    longitude: -89.6441
  },
  {
    name: 'Forge & Flame Grill',
    category: 'food',
    address: '902 Quarry Rd',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    phone: '(217) 555-0121',
    website: 'https://forgeflame.example.com',
    hours: 'Mon-Sat 11am-10pm, Sun 11am-8pm',
    priceLevel: '$$$',
    tags: ['steakhouse', 'grill', 'bar'],
    description: 'Wood-fired steaks, craft cocktails, and a chef-driven seasonal menu.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1555992336-cbf8c5d8e5b9?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('11:00', '22:00'),
    latitude: 39.7871,
    longitude: -89.6312
  },
  {
    name: 'Cornerstone Pharmacy',
    category: 'health',
    address: '155 Harbor Blvd',
    city: 'Springfield',
    state: 'IL',
    zip: '62707',
    phone: '(217) 555-0114',
    website: 'https://cornerstonepharmacy.example.com',
    hours: 'Mon-Fri 9am-7pm, Sat 9am-2pm',
    priceLevel: '$$',
    tags: ['pharmacy', 'vaccines', 'delivery'],
    description: 'Family-owned pharmacy with same-day prescriptions and delivery.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504814532849-927f2d056c1e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '19:00'),
    latitude: 39.8268,
    longitude: -89.6111
  },
  {
    name: 'Granite Ridge Outdoors',
    category: 'retail',
    address: '330 Summit Dr',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    phone: '(217) 555-0155',
    website: 'https://graniteridgeoutdoors.example.com',
    hours: 'Mon-Sat 9am-7pm, Sun 11am-5pm',
    priceLevel: '$$$',
    tags: ['outdoor', 'camping', 'gear'],
    description: 'Camping gear, trail maps, and outfitting advice from local experts.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '19:00'),
    latitude: 39.7722,
    longitude: -89.6893
  },
  {
    name: 'Roosevelt Insurance Advisors',
    category: 'services',
    address: '650 Capitol Ave',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(217) 555-0183',
    website: 'https://rooseveltinsurance.example.com',
    hours: 'Mon-Fri 8:30am-5:30pm',
    priceLevel: '$$',
    tags: ['insurance', 'auto', 'home'],
    description: 'Independent agency shopping the best auto, home, and life policies.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('08:30', '17:30'),
    latitude: 39.7987,
    longitude: -89.6534
  },
  {
    name: 'Whistle Stop Toy Co.',
    category: 'retail',
    address: '74 Station Way',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    phone: '(217) 555-0175',
    website: 'https://whistlestoptoys.example.com',
    hours: 'Mon-Sat 10am-6pm',
    priceLevel: '$$',
    tags: ['toys', 'family', 'gifts'],
    description: 'Hands-on toy shop with puzzles, STEM kits, and story-time sessions.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('10:00', '18:00'),
    latitude: 39.8162,
    longitude: -89.6572
  },
  {
    name: 'Horizon Realty Group',
    category: 'services',
    address: '100 Skyline Dr',
    city: 'Springfield',
    state: 'IL',
    zip: '62705',
    phone: '(217) 555-0130',
    website: 'https://horizonrealty.example.com',
    hours: 'Mon-Fri 9am-6pm',
    priceLevel: '$$$',
    tags: ['real estate', 'buyers', 'sellers'],
    description: 'Local agents guiding buyers and sellers with personalized tours.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '18:00'),
    latitude: 39.7769,
    longitude: -89.6761
  },
  {
    name: 'Aurora Event Hall',
    category: 'entertainment',
    address: '505 Aurora Pkwy',
    city: 'Springfield',
    state: 'IL',
    zip: '62706',
    phone: '(217) 555-0180',
    website: 'https://auroraeventhall.example.com',
    hours: 'Mon-Sun 9am-10pm',
    priceLevel: '$$$',
    tags: ['events', 'venue', 'weddings'],
    description: 'Modern event venue with in-house catering and lighting packages.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '22:00'),
    latitude: 39.8042,
    longitude: -89.6642
  },
  {
    name: 'Riverside Vet Clinic',
    category: 'health',
    address: '40 Riverside Dr',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(217) 555-0112',
    website: 'https://riversidevet.example.com',
    hours: 'Mon-Fri 8am-6pm, Sat 9am-1pm',
    priceLevel: '$$$',
    tags: ['veterinary', 'pets', 'wellness'],
    description: 'Full-service veterinary care with same-day urgent appointments.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('08:00', '18:00'),
    latitude: 39.8048,
    longitude: -89.6511
  },
  {
    name: 'Atlas Tire & Alignment',
    category: 'auto',
    address: '777 Motor Pkwy',
    city: 'Springfield',
    state: 'IL',
    zip: '62707',
    phone: '(217) 555-0199',
    website: 'https://atlastire.example.com',
    hours: 'Mon-Fri 7am-6pm, Sat 8am-2pm',
    priceLevel: '$$',
    tags: ['tires', 'alignment', 'service'],
    description: 'New tires, rotations, and alignment packages with free inspections.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('07:00', '18:00'),
    latitude: 39.8364,
    longitude: -89.6019
  },
  {
    name: 'Moonlight Cinema',
    category: 'entertainment',
    address: '220 Cinema Blvd',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    phone: '(217) 555-0135',
    website: 'https://moonlightcinema.example.com',
    hours: 'Daily 11am-11pm',
    priceLevel: '$$',
    tags: ['movies', 'tickets', 'snacks'],
    description: 'Independent theater with comfy seating and local snacks.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('11:00', '23:00'),
    latitude: 39.8212,
    longitude: -89.6589
  },
  {
    name: 'Willow Creek Spa & Salon',
    category: 'beauty',
    address: '19 Willow Creek Way',
    city: 'Springfield',
    state: 'IL',
    zip: '62705',
    phone: '(217) 555-0165',
    website: 'https://willowcreekspa.example.com',
    hours: 'Tue-Sat 9am-7pm',
    priceLevel: '$$$',
    tags: ['spa', 'massage', 'hair'],
    description: 'Full-service salon with massage, facials, and bridal styling.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1508385082359-f38ae991e8f6?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('09:00', '19:00'),
    latitude: 39.7711,
    longitude: -89.6842
  },
  {
    name: 'BrightPath Learning Center',
    category: 'services',
    address: '300 Lantern Rd',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    phone: '(217) 555-0184',
    website: 'https://brightpathlearning.example.com',
    hours: 'Mon-Fri 7am-6pm',
    priceLevel: '$$',
    tags: ['childcare', 'learning', 'after school'],
    description: 'After-school programs with STEM labs and homework support.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('07:00', '18:00'),
    latitude: 39.7818,
    longitude: -89.6624
  },
  {
    name: 'Summit Roofing & Exteriors',
    category: 'home',
    address: '410 Summit Blvd',
    city: 'Springfield',
    state: 'IL',
    zip: '62707',
    phone: '(217) 555-0191',
    website: 'https://summitroofing.example.com',
    hours: 'Mon-Fri 8am-5pm',
    priceLevel: '$$$',
    tags: ['roofing', 'siding', 'repairs'],
    description: 'Storm damage repairs, inspections, and exterior upgrades.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1484632152040-840235adc262?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('08:00', '17:00'),
    latitude: 39.8342,
    longitude: -89.6082
  },
  {
    name: 'Lantern Lane Boutique',
    category: 'retail',
    address: '210 Lantern Ln',
    city: 'Springfield',
    state: 'IL',
    zip: '62705',
    phone: '(217) 555-0181',
    website: 'https://lanternlane.example.com',
    hours: 'Tue-Sat 10am-6pm',
    priceLevel: '$$',
    tags: ['fashion', 'boutique', 'local'],
    description: 'Seasonal styles, accessories, and locally made gifts.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('10:00', '18:00'),
    latitude: 39.7719,
    longitude: -89.6768
  },
  {
    name: 'Union Square Legal',
    category: 'services',
    address: '410 Union Sq',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '(217) 555-0193',
    website: 'https://unionsquarelegal.example.com',
    hours: 'Mon-Fri 8am-5pm',
    priceLevel: '$$$',
    tags: ['legal', 'business', 'family'],
    description: 'Client-focused legal team for family and small business support.',
    verifiedBadge: true,
    imageUrl: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('08:00', '17:00'),
    latitude: 39.7981,
    longitude: -89.6541
  },
  {
    name: 'Golden Hour Photography',
    category: 'services',
    address: '12 Vista Lane',
    city: 'Springfield',
    state: 'IL',
    zip: '62705',
    phone: '(217) 555-0166',
    website: 'https://goldenhourphoto.example.com',
    hours: 'Tue-Sat 10am-7pm',
    priceLevel: '$$$',
    tags: ['photography', 'portraits', 'events'],
    description: 'Portrait sessions, events, and brand photography packages.',
    verifiedBadge: false,
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'
    ],
    hoursJson: makeHours('10:00', '19:00'),
    latitude: 39.7726,
    longitude: -89.6762
  }
];

const seedDeals = (businessRows) => {
  const deals = [];
  const dealTemplates = [
    { title: 'Weekday Boost', description: 'Save on weekday visits', discount: '15% off', terms: 'Valid Mon-Thu only.' },
    { title: 'First-Time Offer', description: 'Intro discount for new customers', discount: '$10 off', terms: 'New customers only.' },
    { title: 'Family Bundle', description: 'Bundle deal for families', discount: 'Buy 1 get 1 50% off', terms: 'Same visit only.' },
    { title: 'Local Hero Special', description: 'Community appreciation discount', discount: '20% off', terms: 'ID required.' },
    { title: 'Seasonal Savings', description: 'Limited-time seasonal offer', discount: '25% off', terms: 'While supplies last.' },
    { title: 'Happy Hour', description: 'Limited-time pricing window', discount: '2-for-1', terms: 'See staff for details.' }
  ];
  businessRows.forEach((biz, idx) => {
    const template = dealTemplates[idx % dealTemplates.length];
    const start = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const end = new Date(Date.now() + (10 + (idx % 12)) * 24 * 60 * 60 * 1000);
    deals.push({
      id: makeId('deal'),
      business_id: biz.id,
      title: `${biz.name} ${template.title}`,
      description: `${template.description} at ${biz.name}.`,
      discount_value: template.discount,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      terms: template.terms,
      coupon_code: `SAVE${idx + 10}`,
      redemption_instructions: 'Show this code at checkout.',
      category: biz.category,
      view_count: Math.floor(Math.random() * 120),
      copy_count: Math.floor(Math.random() * 60),
      created_at: nowIso()
    });
    const second = dealTemplates[(idx + 2) % dealTemplates.length];
    const endAlt = new Date(Date.now() + (6 + (idx % 9)) * 24 * 60 * 60 * 1000);
    deals.push({
      id: makeId('deal'),
      business_id: biz.id,
      title: `${biz.name} ${second.title}`,
      description: `${second.description} with ${biz.name}.`,
      discount_value: second.discount,
      start_date: start.toISOString(),
      end_date: endAlt.toISOString(),
      terms: second.terms,
      coupon_code: `LOCAL${idx + 30}`,
      redemption_instructions: 'Mention this offer when paying.',
      category: biz.category,
      view_count: Math.floor(Math.random() * 100),
      copy_count: Math.floor(Math.random() * 40),
      created_at: nowIso()
    });
  });
  return deals;
};

const seedReviews = (businessRows, userRows) => {
  const reviews = [];
  const comments = [
    'Friendly staff and fast service.',
    'Loved the atmosphere and quality.',
    'Great value for the price.',
    'Will definitely come back again.',
    'Excellent attention to detail.',
    'Service was smooth and welcoming.'
  ];
  businessRows.forEach((biz, idx) => {
    const reviewCount = 2 + (idx % 3);
    for (let i = 0; i < reviewCount; i += 1) {
      const user = userRows[(idx + i) % userRows.length];
      reviews.push({
        id: makeId('rev'),
        business_id: biz.id,
        user_id: user.id,
        rating: 4 + (i % 2),
        review_text: comments[(idx + i) % comments.length],
        created_at: nowIso()
      });
    }
  });
  return reviews;
};

const seed = () => {
  db.exec('DELETE FROM deal_interactions;');
  db.exec('DELETE FROM bookmarks;');
  db.exec('DELETE FROM reviews;');
  db.exec('DELETE FROM deals;');
  db.exec('DELETE FROM businesses;');
  db.exec('DELETE FROM users;');

  const admin = {
    id: makeId('user'),
    full_name: 'StreetPulse Admin',
    email: ADMIN_EMAIL,
    password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
    role: 'admin',
    created_at: nowIso()
  };

  const memberSeeds = [
    { full_name: 'Jamie Reader', email: 'jamie@example.com' },
    { full_name: 'Taylor Nguyen', email: 'taylor@example.com' },
    { full_name: 'Priya Patel', email: 'priya@example.com' },
    { full_name: 'Marcus Reed', email: 'marcus@example.com' },
    { full_name: 'Elena Torres', email: 'elena@example.com' },
    { full_name: 'Noah Brooks', email: 'noah@example.com' },
    { full_name: 'Sofia Chen', email: 'sofia@example.com' },
    { full_name: 'Luis Alvarez', email: 'luis@example.com' },
    { full_name: 'Ava Jordan', email: 'ava@example.com' },
    { full_name: 'Zoe Carter', email: 'zoe@example.com' }
  ];

  const members = memberSeeds.map((seed) => ({
    id: makeId('user'),
    full_name: seed.full_name,
    email: seed.email,
    password_hash: bcrypt.hashSync('welcome123', 10),
    role: 'member',
    created_at: nowIso()
  }));

  db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, created_at)
    VALUES (@id, @full_name, @email, @password_hash, @role, @created_at)
  `).run(admin);
  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, created_at)
    VALUES (@id, @full_name, @email, @password_hash, @role, @created_at)
  `);

  members.forEach((member) => insertUser.run(member));

  const businessRows = businesses.map((biz) => ({
    id: makeId('biz'),
    name: biz.name,
    category: biz.category,
    address: biz.address,
    city: biz.city,
    state: biz.state,
    zip: biz.zip,
    phone: biz.phone,
    website: biz.website,
    hours_text: biz.hours,
    hours_json: JSON.stringify(biz.hoursJson),
    price_level: biz.priceLevel,
    tags_json: JSON.stringify(biz.tags),
    description: biz.description,
    verified_badge: biz.verifiedBadge ? 1 : 0,
    image_url: biz.imageUrl,
    gallery_json: JSON.stringify(biz.gallery),
    latitude: biz.latitude,
    longitude: biz.longitude,
    created_at: nowIso()
  }));

  const insertBusiness = db.prepare(`
    INSERT INTO businesses (
      id, name, category, address, city, state, zip, phone, website,
      hours_text, hours_json, price_level, tags_json, description, verified_badge,
      image_url, gallery_json, latitude, longitude, created_at
    )
    VALUES (
      @id, @name, @category, @address, @city, @state, @zip, @phone, @website,
      @hours_text, @hours_json, @price_level, @tags_json, @description, @verified_badge,
      @image_url, @gallery_json, @latitude, @longitude, @created_at
    )
  `);
  businessRows.forEach((row) => insertBusiness.run(row));

  const deals = seedDeals(businessRows);
  const insertDeal = db.prepare(`
    INSERT INTO deals (
      id, business_id, title, description, discount_value, start_date, end_date,
      terms, coupon_code, redemption_instructions, category, view_count, copy_count, created_at
    )
    VALUES (
      @id, @business_id, @title, @description, @discount_value, @start_date, @end_date,
      @terms, @coupon_code, @redemption_instructions, @category, @view_count, @copy_count, @created_at
    )
  `);
  deals.forEach((deal) => insertDeal.run(deal));

  const reviews = seedReviews(businessRows, [admin, ...members]);
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, business_id, user_id, rating, review_text, created_at)
    VALUES (@id, @business_id, @user_id, @rating, @review_text, @created_at)
  `);
  reviews.forEach((review) => insertReview.run(review));

  console.log(`Seeded ${businessRows.length} businesses, ${deals.length} deals, ${reviews.length} reviews.`);
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
};

seed();
