const {Edupage, Lesson, Teacher, Student, Class, Classroom} = require("edupage-api"),
      edupage = new Edupage(), /* Create a new instance of the edupage-api */
      keychain = require("./.keychain.json"), /* Load the keychain secrets SHHHHHH! */
      ics = require('ics'), /* Load the icalendar module */
      moment = require('moment-timezone'), /* Load the moment module */
      urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm, /* `urlRegex` is a regex that matches a url */
      protoy = require('./lib/protoy'), /* import the prototypes */
      { writeFileSync } = require('fs'), /* import the fs module */
      ownCalendarOrganName = (keychain.hasOwnProperty("organizerName")) ? String(keychain.organizerName) : 'slovak-cat/EdupageCal',
      app = require('express')();
var lastTime;

if (keychain.hasOwnProperty("downloadKeychain")) {} else {
    console.log("Please make a secure password in the .keychain.json file in this directory")
    process.exit()
}

app.get('/:key', function (req, res) {
    if (req.params.key === keychain.downloadKeychain) {
        educal().then(data => {
            res.setHeader('Content-Type', 'text/calendar');
            res.send(data);
        })
    } else { res.send('Wrong key') }
  })
   
app.listen(4352, () => console.log('Edupage Calendar listening on port 4352! Try http://localhost:4352/<your key in .keychain.json>'))

async function educal() {
    let cal = []
    await edupage.login(keychain.name, keychain.password);

    //Choose a date range
    const from = new Date("2021-12-10");
    const to = new Date(moment().add(3, 'weeks').format('llll'));

    //Fetch array of the timetables
    //Note: This will also update `edupage.timetables` array
    const timetables = await edupage.fetchTimetablesForDates(from, to);

    timetables.forEach(day => {
        lastTime = [0,0]
        day.lessons.forEach(lesson => {
            cal.push(makeLessonIcal(lesson));
            //console.dir(lesson)
        })
    })
    const { error, value } = ics.createEvents(cal);
    if (error) {
        console.log(error)
        return
    }

    return value
}

/**
 * @param  {Lesson} l
 */
function makeLessonIcal(l) {
    //console.log(l)
    let dL = String(l.id).split(':')[0].split('-');
    let per = l.period;

    var startTime;
    var endTime;
    if (per != undefined) {
        startTime = [Number(per.startTime.split(':')[0]), Number(per.startTime.split(':')[1])]
          endTime = [Number(per.endTime.split(':')[0]), Number(per.endTime.split(':')[1])]
    } else { startTime = [(lastTime[1] === 59) ? lastTime[0]+1:lastTime[0], lastTime[1]+1] 
               endTime = [(lastTime[1] === 59) ? lastTime[0]+2:lastTime[0], lastTime[1]+2]}

    let start = [Number(dL[0]), Number(dL[1]), Number(dL[2]), startTime[0], startTime[1]];
    let end = [Number(dL[0]), Number(dL[1]), Number(dL[2]), endTime[0], endTime[1]];

    let lessJSON = {
        start: start,
        end: end,
        title: `${l.subject.name} (${l.subject.short})`,
        description: makeDescription(l),
        location: `${makeLocName(l.classrooms, l.classes, l.onlineLessonURL)}`,
        url: (l.isOnlineLesson) ? l.onlineLessonURL : l.edupage.baseUrl,
        categories: [l.subject.name,l.subject.short, 'Edupage', l.edupage.ASC.schoolName, l.edupage.user.origin],
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: ownCalendarOrganName, email: 'edupagecal@charliecat.space' },
        attendees: makeAttendeesL(l.teachers, l.students),
        uid: `${l.id}@edupagecal.${edupage.user.origin}.edu`,
        calName: 'EduPage Calendar',
        productId: 'charliecatto/edupagecal'
    }
    lastTime = [endTime[0], endTime[1]]
    console.log(lessJSON)
    return lessJSON;
}
/**
 * @param  {Teacher} [teachers]
 * @param  {Student} [students]
 * @return {Array<object>} 
 */
function makeAttendeesL(teachers, students) {
    let attendArr = [];
    if (typeof(teachers[0]) === 'undefined') {} else {
        for (let i = 0; i < teachers.length; i++) {
            attendArr.push({
                name: `${teachers[i].firstname} ${teachers[i].lastname}`,
                email: placeholderMailsTeacher(teachers[i]),
                rsvp: true,
                partstat: 'ACCEPTED',
                role: 'REQ-PARTICIPANT'
            });
        }
    }
    attendArr.push({ name: `${students.length} other students`, email: `${students.length}.students@example.com`, role: 'REQ-PARTICIPANT' })
    return attendArr;
}

/**
 * @param  {Teacher} teacher
 * @return {String} Teacher's email according to edupage or placeholder in `.keychain.json`
 */
function placeholderMailsTeacher(teacher) {
    //console.log(teacher.email)
    let emails;
    if (keychain.hasOwnProperty("teacherEmailSchema") && teacher.email === null) {
        emails = keychain.teacherEmailSchema.replace('[firstName]', String(teacher.firstname))
        emails = emails.replace('[lastName]', String(teacher.lastname))
        emails = emails.replace('[firstNameIni]', String(teacher.firstname).split('')[0])
        emails = emails.replace('[lastNameIni]', String(teacher.lastname).split('')[0]);
        return emails.toLowerCase().withoutDiacritics();
    } else return String(teacher.email)
}
/**
 * @param  {Array<Classroom>} clr
 * @param  {Array<Class>} classes
 * @param  {String|null} onlineLessonURL
 */
function makeLocName(clr, classes, onlineLessonURL) {
    if (onlineLessonURL !== null) return onlineLessonURL.split('//').pop().split('/')[0];
    if (clr.length === 0) {
        let classrooms = '';
        classes.forEach(e => {
            classrooms += e.short + ', ';
        })
        return classrooms + `${edupage.ASC.schoolName}`
    } else if (clr !== 0) {
        let classrooms = '';
        clr.forEach(e => {
            classrooms += e.name + ', ';
        })
        return classrooms + `${edupage.ASC.schoolName}`
    }
    return edupage.ASC.schoolName;
}

/**
 * @param  {Lesson} l
 */
function makeDescription(l) {
    //console.log(l)

    let description = ``
    let teacher = []
    if (typeof(l.teachers[0]) === 'undefined') { teacher.push('Noone') } else {
        for (let i = 0; i < l.teachers.length; i++) {
            teacher.push(`${l.teachers[i].firstname} ${l.teachers[i].lastname}`);
        }
    }
    description += `• Teacher(s): ${teacher.join(', ')}`
    if (l.isOnlineLesson) description += `\n• URL: ${l.onlineLessonURL}`;
    let homework = [];
    if (l.assignments.length !== 0) {
        l.assignments.forEach(e => {
            homework.push(`${e.title} ${(e.grades.length !== 0) ? `(${e.grades.join(', ')})` : ''}`);
        })
    } else { homework.push('There wasn\'t one') }
    description += `\n• Homework: ${homework.join('\n• Homework:')}`;
    return description;
}
