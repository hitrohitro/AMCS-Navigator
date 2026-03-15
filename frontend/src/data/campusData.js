export const blockLayouts = [
  { id: 'I', row: 1, column: 3, width: 6, height: 1, tone: 'neutral' },
  { id: 'H', row: 1, column: 11, width: 2, height: 2, tone: 'accent' },
  { id: 'J', row: 2, column: 13, width: 3, height: 3, tone: 'accent' },
  { id: 'B', row: 4, column: 1, width: 3, height: 2, tone: 'neutral' },
  { id: 'Y', row: 4, column: 4, width: 1, height: 4, tone: 'accent' },
  { id: 'G', row: 3, column: 6, width: 2, height: 4, tone: 'neutral' },
  { id: 'F', row: 3, column: 8, width: 3, height: 2, tone: 'accent' },
  { id: 'T', row: 3, column: 11, width: 2, height: 2, tone: 'accent' },
  { id: 'D', row: 7, column: 5, width: 3, height: 1, tone: 'neutral' },
  { id: 'A', row: 8, column: 1, width: 3, height: 4, tone: 'accent' },
  { id: 'C', row: 10, column: 4, width: 1, height: 2, tone: 'neutral' },
  { id: 'E', row: 8, column: 10, width: 2, height: 4, tone: 'accent' },
  { id: 'K', row: 8, column: 12, width: 2, height: 4, tone: 'accent' },
  { id: 'M', row: 8, column: 14, width: 2, height: 4, tone: 'accent' },
]

export const blockInfo = {
  A: { name: 'AI and Data Lab', department: 'Artificial Intelligence', connector: 'South entrance corridor' },
  B: { name: 'Basic Sciences Wing', department: 'Common facilities', connector: 'West foyer' },
  C: { name: 'Central Help Point', department: 'Student support', connector: 'Near block A lobby' },
  D: { name: 'Design Studio', department: 'Product and UI labs', connector: 'Ground passage' },
  E: { name: 'Embedded Systems Hub', department: 'ECE and IoT labs', connector: 'South-east walkway' },
  F: { name: 'Faculty Lounge', department: 'Administration', connector: 'Mid connector spine' },
  G: { name: 'General Classrooms', department: 'Shared lecture rooms', connector: 'Central stairwell' },
  H: { name: 'High Performance Lab', department: 'Computing research', connector: 'North-east core' },
  I: { name: 'Innovation Gallery', department: 'Showcase and events', connector: 'Upper corridor' },
  J: { name: 'Junior Lecture Theatres', department: 'Large classrooms', connector: 'East plaza entry' },
  K: { name: 'Knowledge Center', department: 'Reference spaces', connector: 'South-east plaza' },
  M: { name: 'Makerspace', department: 'Rapid prototyping', connector: 'Far east access' },
  T: { name: 'Tutorial Rooms', department: 'Small group teaching', connector: 'North-east bridge' },
  Y: { name: 'Youth Incubation Cell', department: 'Startup mentoring', connector: 'Vertical link lobby' },
}

export const timetable = [
  {
    day: 'Monday',
    items: [
      { time: '08:30 - 09:20', subject: 'Machine Learning', room: 'J201', faculty: 'Dr. V. Kumar' },
      { time: '09:30 - 10:20', subject: 'UI Engineering', room: 'D104', faculty: 'Prof. N. Meena' },
      { time: '10:40 - 12:20', subject: 'Compiler Lab', room: 'A302', faculty: 'Ms. Deepa' },
      { time: '13:20 - 14:10', subject: 'Probability', room: 'G105', faculty: 'Dr. Saravanan' },
    ],
  },
  {
    day: 'Tuesday',
    items: [
      { time: '08:30 - 09:20', subject: 'Database Systems', room: 'H103', faculty: 'Dr. Shalini' },
      { time: '09:30 - 10:20', subject: 'Placement Training', room: 'I Hall', faculty: 'Career Cell' },
      { time: '11:30 - 12:20', subject: 'Open Elective', room: 'K204', faculty: 'Guest Faculty' },
      { time: '14:20 - 16:00', subject: 'Mini Project Review', room: 'M Lab', faculty: 'Panel' },
    ],
  },
  {
    day: 'Wednesday',
    items: [
      { time: '08:30 - 10:10', subject: 'Networks Lab', room: 'E202', faculty: 'Mr. Prakash' },
      { time: '10:30 - 11:20', subject: 'Software Design', room: 'T101', faculty: 'Ms. Revathi' },
      { time: '13:20 - 14:10', subject: 'Mentor Hour', room: 'Y Hub', faculty: 'Faculty Advisor' },
      { time: '14:20 - 15:10', subject: 'Free Slot', room: 'Library', faculty: 'Self study' },
    ],
  },
  {
    day: 'Saturday',
    items: [
      { time: '09:00 - 10:00', subject: 'Workshop on AI', room: 'Auditorium', faculty: 'Dr. A. Kumar' },
      { time: '10:30 - 11:30', subject: 'Group Discussion', room: 'Seminar Hall', faculty: 'Prof. B. Singh' },
      { time: '13:00 - 14:00', subject: 'Sports Activity', room: 'Ground', faculty: 'Physical Education Dept' },
    ],
  },
]

export const externalLinks = [
  { id: 'ecampus', label: 'eCampus', href: 'https://ecampus.psgtech.ac.in/studzone/' },
  { id: 'hostel', label: 'Hostel', href: 'https://edviewx.psgtech.ac.in/Hostel' },
]

export const horizontalBridges = [
  ['M1', 'K1'], ['M2', 'J2'], ['M3', 'K3'], ['M3', 'J3'], ['M4', 'K4'], ['M4', 'J4'],
  ['K1', 'E1'], ['K2', 'J2'], ['K2', 'E2'], ['K3', 'E3'], ['K4', 'E4'],
  ['J2', 'M2'], ['J3', 'M3'], ['J4', 'M4'],
  ['E1', 'F1'], ['E2', 'F2'], ['E3', 'F3'], ['E4', 'F4'],
  ['F1', 'G1'], ['F2', 'G2'], ['F3', 'G3'], ['F4', 'G4'],
  ['A1', 'Y2'],
]
