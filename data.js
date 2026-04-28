// Mock users in Mysuru
const MOCK_USERS = [
  { id: 1, name: "Vijayanagar User", lat: 12.3278, lng: 76.6200, fillLevel: Math.floor(Math.random() * 100), type: "home" },
  { id: 2, name: "Kuvempunagar Point", lat: 12.2870, lng: 76.6345, fillLevel: Math.floor(Math.random() * 100), type: "point" },
  { id: 3, name: "Saraswathipuram", lat: 12.3040, lng: 76.6322, fillLevel: Math.floor(Math.random() * 100), type: "home" },
  { id: 4, name: "Jayalakshmipuram", lat: 12.3210, lng: 76.6300, fillLevel: Math.floor(Math.random() * 100), type: "home" },
  { id: 5, name: "Gokulam Point", lat: 12.3298, lng: 76.6358, fillLevel: Math.floor(Math.random() * 100), type: "point" },
  { id: 6, name: "Rajivnagar", lat: 12.3250, lng: 76.6710, fillLevel: Math.floor(Math.random() * 100), type: "home" },
  { id: 7, name: "Nazarbad", lat: 12.3110, lng: 76.6660, fillLevel: Math.floor(Math.random() * 100), type: "home" },
  { id: 8, name: "Hebbal", lat: 12.3480, lng: 76.6190, fillLevel: Math.floor(Math.random() * 100), type: "home" },
  { id: 9, name: "Lashkar Mohalla", lat: 12.3150, lng: 76.6570, fillLevel: Math.floor(Math.random() * 100), type: "point" },
  { id: 10, name: "Devaraja Market", lat: 12.3080, lng: 76.6510, fillLevel: Math.floor(Math.random() * 100), type: "point" }
];

// Ensure at least some users are > 70% for testing
MOCK_USERS[0].fillLevel = 85;
MOCK_USERS[4].fillLevel = 92;
MOCK_USERS[8].fillLevel = 75;
