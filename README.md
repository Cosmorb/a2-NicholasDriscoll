Assignment 2 - Short Stack: Basic Two-tier Web Application using HTML/CSS/JS and Node.js  
===

Due: Monday, September 8, 2025, by 11:59 PM.

This assignment aims to introduce you to creating a prototype two-tiered web application. 
Your application will include the use of HTML, CSS, JavaScript, and Node.js functionality, with active communication between the client and the server over the life of a user session.

Baseline Requirements
---

There is a large range of application areas and possibilities that meet these baseline requirements. 
Try to make your application do something useful! A todo list, storing / retrieving high scores for a very simple game... have a little fun with it.

Your application is required to implement the following functionalities (4 pts each, total 20 pts):

- a `Server` which not only serves files, but also maintains a tabular dataset with 3 or more fields related to your application
- a `Results` functionality which shows the entire dataset residing in the server's memory
- a `Form/Entry` functionality which allows a user to add or delete data items residing in the server's memory
- a `Server Logic` which, upon receiving new or modified "incoming" data, includes and uses a function that adds at least one additional derived field to this incoming data before integrating it with the existing dataset
- the `Derived field` for a new row of data must be computed based on fields already existing in the row. 
For example, a `todo` dataset with `task`, `priority`, and `creation_date` may generate a new field `deadline` by looking at `creation_date` and `priority`

Your application is required to demonstrate the use of the following concepts:

HTML (4 pts each, total 16 pts):
- One or more [HTML Forms](https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms), with any combination of form tags appropriate for the user input portion of the application
- A results page displaying all data currently available on the server. You will most likely use a `<table>` tag for this, but `<ul>` or `<ol>` could also work and might be simpler to work with. Alternatively, you can create a single-page app (see Technical Acheivements) but this is not a requirement.
- All pages should [validate](https://validator.w3.org)
- If your app contains multple pages, they should all be accessible from the homepage (index.html)

CSS (4 pts each, total 16 pts):
- CSS styling of the primary visual elements in the application
- Various CSS Selector functionality must be demonstrated:
    - Element selectors
    - ID selectors
    - Class selectors
- CSS positioning and styling of the primary visual elements in the application:
    - Use of either a CSS grid or flexbox for layout
    - Rules defining fonts for all text used; no default fonts! Be sure to use a web safe font or a font from a web service like [Google Fonts](http://fonts.google.com/)
- CSS defined in a maintainable, readable form, in external stylesheets 

JavaScript (4 pts):
- At minimum, a small amount of front-end JavaScript to get / fetch data from the server; a sample is provided in this repository.

Node.js (4 pts):
- An HTTP Server that delivers all necessary files and data for the application, and also creates the required `Derived Fields` in your data. 
A starting point is provided in this repository.

Deliverables
---

1. (5 pts) Fork the starting project code repo. The starter code in the repo may be used or discarded as needed.
2. (60 pts, detailed above) Implement your project with the above requirements.
3. Test your project to make sure that when someone goes to your main page, it displays correctly.
4. (5 pts) Deploy your project to Render (or your hosting service of choice), and fill in the appropriate fields in your package.json file.
5. (5 pts) Ensure that your project at least starts with the proper naming scheme `a2-FirstnameLastname` so we can find it.
6. (5 pts) Modify the README to the specifications below, and delete all of the instructions originally found in this README.
7. (5 pts) Create and submit a Pull Request to the original repo. Be sure to include your name in the pull request.

Acheivements
---

Below are suggested technical and design achievements. You can use these to help customize the assignment to your personal interests. These are recommended acheivements, but feel free to create/implement your own... just make sure you thoroughly describe what you did in your README and why it was challenging. ALL ACHIEVEMENTS MUST BE DESCRIBED IN YOUR README IN ORDER TO GET CREDIT FOR THEM. Remember, the highest grade you can get on any individual assignment is a 100%.

*Technical*
- (5 points) Create a single-page app that both provides a form for users to submit data and always shows the current state of the server-side data. To put it another way, when the user submits data, the server should respond sending back the updated data (including the derived field calculated on the server) and the client should then update its data display.

- (5 points) In addition to a form enabling adding and deleting data on the server, also add the ability to modify existing data.

*Design/UX*
- (5 points per person, with a max of 10 points) Test your user interface with others. Define a specific task for them to complete (ideally something short that takes <10 minutes), and then use the [think-aloud protocol](https://en.wikipedia.org/wiki/Think_aloud_protocol) to obtain feedback on your design (talk-aloud is also fine). Important considerations when designing your study:

1. Make sure you start the study by clearly stating the task that you expect your user to accomplish.
2. You shouldn't provide any verbal instructions on how to use your interface / accomplish the task you give them. Make sure that your interface is clear enough that users can figure it out without any instruction, or provide text instructions from within the interface itself. 
3. If users get stuck to the point where they give up, you can then provde instruction so that the study can continue, but make sure to discuss this in your README. You won't lose any points for this... all feedback is good feedback!

You'll need to use sometype of collaborative software that will enable you both to see the test subject's screen and listen to their voice as they describe their thoughts, or conduct the studies in person. After completing each study, briefly (one to two sentences for each question) address the following in your README:

1. Provide the last name of each student you conduct the evaluation with.
2. What problems did the user have with your design?
3. What comments did they make that surprised you?
4. What would you change about the interface based on their feedback?

*You do not need to actually make changes based on their feedback*. This acheivement is designed to help gain experience testing user interfaces. If you run two user studies, you should answer two sets of questions. 

Important Notes
---
* For this and future assignments, you should choose **Web Service** instead of "Static Page" when uploading to Render. On the New Project page, you should leave all fields as their default values except under **Instance Type**, where you should select the free tier.
* You are **strongly encouraged** to create a [.gitignore file](https://git-scm.com/docs/gitignore) that will keep your node_modules folder and any other stray files (such as package-lock.json) out of your online repo. 


FAQ
---
**Q: I'm getting a 404 error on render. Why?**

A: Make sure that you've uploaded your project as a Web Service, not a Static Page. Also verify that any stray files (such as package-lock.json) are not in your online repository.

**Q: What fields should I fill out in the package.json file?**

A: Give the name field your project name and the version field 1.0.0. You can leave the others blank.

**Q: On Windows, I'm getting an Execution Policy exception when starting npm.**

A: You may need to make a policy change on your machine. Check out the following links for more information on how to fix it.

* [npm Not Working (Reddit)](https://www.reddit.com/r/node/comments/1h6wer2/npm_not_working_on_windows_after_install_and/)
* [Set-Execution Policy](https://www.pdq.com/powershell/set-executionpolicy/)
* [Successfully Changing Execution Policy (StackOverflow)](https://stackoverflow.com/questions/27753917/how-do-you-successfully-change-execution-policy-and-enable-execution-of-powershe)

**Q: Can I use frameworks for this assignment?**

A: No. We'll discuss them later this term, but for right now, we want to see that you can implement these features yourself instead of outsourcing them to an existing framework or library.

**Q: After I delete some data server-side, the data persists on the client side until I refresh the page.**

A: Make sure the client-side copy of the data also reflects the deletion. The server-side and client-side copies of the data should remain in sync at all times.

**Q: Do I have to implement the specific achievements above?**

A: No. As discussed in the instructions, you are free to implement your own. If you're not sure if they'll qualify, check with the instructor.

**Q: If I do a single page for the technical achievement, will I still get credit for the last two criteria in the base requirements?**

Yes.


Sample Readme (delete the above when you're ready to submit, and modify the below so with your links and descriptions)
---

## Your Web Application Title
Include a very brief summary of your project here. Be sure to include the CSS positioning technique you used, and any required instructions to use your application.

## Technical Achievements
- **Tech Achievement 1**: Using a combination of...

### Design/Evaluation Achievements
- **Design Achievement 1**: 
