# Volunteer Tracker Demo

This demo showcases a project developed during my time as a volunteer for a [local charity](https://matthewshouse.org.uk/). It serves as a functional representation of the application, excluding user authentication and email notifications (which are in the production version). The backend is built with Express, Mongoose, and MongoDB, while the front end leverages React, Redux, and Material-UI.

Have a play around with the [functional demo](https://volunteer-tracker-demo.up.railway.app)! *(Please note that the database is reset and seeded every 30 minutes)*

## Project Background

During my time volunteering, I was interested in the technical side of running the charity. When speaking with the project lead Thom, we identified a significant challenge. The charity relied on manual tracking through spreadsheets, leading to inefficiencies in managing volunteer information. Working closely with Thom, I proposed and developed a system that automated these tasks, streamlining operations and ensuring reliable communication.

### Expectations and Achievements
**Expectations:** My primary goal was to gain hands-on experience in building a full working application from conceptualization to deployment. Initially having it be used by the charity in day-to-day operations was something I didn't think would actually happen.

**Achievements**:Through effort and collaborative work with Thom, I've realized this goal. The application now plays an integral role in the charity's daily activities, streamlining their volunteer management processes and enhancing overall efficiency. This experience has been invaluable in shaping my proficiency in full-stack development and project deployment.

## Noteworthy Features

- **Upcoming Information Retrieval:** Enables users to efficiently search for events within a specified timeframe, including upcoming training, awards, birthdays, and outstanding documents.
  <img width="1510" alt="Dashboard" src="https://github.com/jakecreely/volunteer-tracker-demo/assets/55953689/8a3f5e82-4e28-43de-a980-24ba2a3e7f1d">

- **Flexible Management:** Users can create, update, and delete awards, documents, roles and training, allowing for easy adjustments to changing requirements. 
  <img width="1502" alt="FlexibleManagementShorter" src="https://github.com/jakecreely/volunteer-tracker-demo/assets/55953689/849d41eb-1d0b-4bdf-9fe7-a1fe951edbcb">

- **Volunteer Lifecycle Management:** Ability to add new volunteers, perform updates to existing volunteer information, and archive inactive volunteers.
  <img width="1502" alt="EditVolunteer" src="https://github.com/jakecreely/volunteer-tracker-demo/assets/55953689/90dde7f3-0edf-41e4-b03e-1d13b8d7222a">

- **Intuitive Filtering and Viewing:** Provides an interface for accessing and filtering for the required information.
  <img width="1502" alt="Filtering" src="https://github.com/jakecreely/volunteer-tracker-demo/assets/55953689/c953a05f-9682-4304-87a9-1a09f469a8ce">

- **Importing Volunteer Data:** A user-friendly process to import the volunteer data from the spreadsheet into the database, including error handling. 

Additional features in the production version not demonstrated in this demo include:

- **Secure User Authentication:** Robust to prevent unauthorized access to both frontend and backend including Role-Based Access Control for staff and volunteer differentiation (volunteers can only read the information).

- **Email Notifications:** Scheduled communication with staff in the mailing list to communicate the upcoming information without having to access the application, leveraging Amazon SES.

## Key Learnings

Developing this project honed my skills and allowed me to develop new ones:

- **Requirement Analysis and Prototyping:** Translating client needs into functional prototypes and obtaining feedback.

- **Robust REST API Design:** API for seamless frontend-backend communication.

- **Automated API Testing**: Implemented testing using Jest and Docker to ensure the reliability and functionality of the API.

- **NoSQL Database Design:** Understanding MongoDB database structure, mongoose and the use cases.

- **Frontend Experience:** Learning about and using React and Redux with MUI for dynamic and user-centric interfaces.

- **Deployment to Production:** Successfully deploying project for real-world application. Understanding docker, environment variables and git version deployment.

- **Presentation and Feedback Handling:** Continuous communication with charity staff, presenting progress and gathering valuable feedback.

- **AWS SES and Task Scheduling:** AWS SES for efficient email communication and scheduling tasks for timely overview notifications and regular data backups.

## Future Endeavors
While the core functionality meets the charity's current needs, I plan to go back through the project to understand where I have gone wrong and how I can improve. Making sure to document my choices. Some of the things I have identified and would change if I started the project from scratch would be:
- **Using TypeScript:** Managing the API responses' structure has sometimes proven challenging, potentially slowing down development. TypeScript could streamline this process.
- **Focus on API Testing:** Writing tests ahead of time or in parallel with route development, following a Test-Driven Development approach, would have saved me time. Initially, I was eager to get the API working, but as it grew, managing it became more complex.
- **Development Perspective:** As I started to look back through the whole project it became clear that my starting mindset was not to assume I was looking at it with fresh eyes. Going forward I will try and keep this in mind by using clear, informative component names and maintaining a consistent project structure.

## Feedback
 Feedback is always appreciated. Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/jake-creely/).

Thank you for exploring this demo!
