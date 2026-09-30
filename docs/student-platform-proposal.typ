// Build: typst compile docs/student-platform-proposal.typ

// Brand colors sampled from the KSHS logo.
#let accent = rgb("#b11c03")
#let accent-green = rgb("#5d7c04")
#let muted = luma(100)

#set document(title: "Proposal: One platform for students, teachers, admins and superadmins")
#set page(
  paper: "a4",
  margin: (x: 2.2cm, y: 2.2cm),
  numbering: "1",
)
#set text(size: 10pt, lang: "en", region: "us")
#set par(justify: true)
#set heading(numbering: "1.")
#show heading: set text(fill: accent)
#show heading.where(level: 1): set text(size: 12.5pt)
#show heading.where(level: 1): set block(above: 1.5em, below: 0.8em)

#set table(
  inset: (x: 6pt, y: 4.5pt),
  align: left + top,
  stroke: (x, y) => (bottom: if y == 0 { 0.8pt + accent } else { 0.4pt + luma(205) }),
)
#show table: set text(size: 9pt)
#show table: set par(justify: false)
#show table.cell.where(y: 0): set text(weight: "bold", fill: accent)

// exceed-logo.png is a placeholder: overwrite it with the real logo, cropped tight on a transparent background.
#block(width: 100%, below: 1.2em, {
  image("exceed-logo.png", height: 1.5cm, alt: "Exceed IT Systems")
  line(length: 100%, stroke: 1.5pt + accent-green)
  v(0.6em)
  text(size: 15pt, weight: "bold", fill: accent)[Proposal]
})

= One platform for students, teachers, admins and superadmins

Kallamino Special High School (KSHS) runs or plans six systems that serve the same students: the LMS, school management (student records, classes, grades, report cards), attendance, the clinic, the dormitory and the meal card. We propose running all six as modules of one platform, with one backend, one database and one sign-in, so that shared records have a single source of truth.
// ERP functions (money, staff and stock) stay on the .NET systems KSHS and TDA already run, and read student details from the platform.

= Web and mobile app

KSHS requested both a web and a mobile app. To minimize technical cost, we propose building both with React.

= Requirements

#set enum(numbering: "a)")
+ *Moderation* (new)
  - Superadmins register the admin of each module: dormitory, registrar, meal card
  - Each admin sees only their own module
+ *Shared core* (new)
  - Student register: ID, name, class, status, QR code
  - Classes and timetable; term calendar
+ *LMS* (built)
  - Courses and lessons; quizzes and assignments with grading
  - Progress and certificates; forums, chat and notifications
+ *School management* (built)
  - Student records, classes, grades and report cards
+ *Meal card* (new)
  - Scan a student's QR card; allow one meal per student per meal time
+ *Dormitory* (new)
  - Look up a student's room, bed and item count
  - Assign a bed, refusing one already taken
+ *Clinic* (new)
  - Look up a student by QR card; record a visit with diagnosis and prescription
+ *Attendance* (new)
  - Record attendance per class; show "at the clinic" instead of "absent"
  - When the doctor recommends rest on specific days, the head of class sees it on the platform and allows it or contacts the doctor

/*
= Where the ERP fits

Each record has one owner, chosen by what it is about: a student's learning and life at school belong to the platform; money, staff and stock belong to the ERP, which stays on .NET.

#table(
  columns: (1.4fr, 0.6fr, 2fr),
  table.header([Record], [Owner], [How the other side uses it]),
  [Student ID, name, class, status], [Platform], [The ERP reads them through a read-only API, for example for fees.],
  [Grades, attendance, LMS work, clinic visits], [Platform], [Never sent to the ERP.],
  [Meals served, bed assignments], [Platform], [The ERP can read meal totals for costing; the beds themselves stay in its asset register.],
  [Payments, budgets, payroll, stock], [ERP], [Not copied into the platform; staff accounts carry the employee number.],
)

The ERP never edits student records, connects with a service account limited to identity and status, and takes all new money, staff and stock needs.
*/
