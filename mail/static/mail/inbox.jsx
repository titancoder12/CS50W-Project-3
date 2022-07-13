document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#compose-submit').addEventListener('click', function () { 
    recipients = document.querySelector('#compose-recipients').value
    subject = document.querySelector('#compose-subject').value
    body = document.querySelector('#compose-body').value
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: String(recipients),
        subject: String(subject),
        body: String(body)
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result)
    });
    return false;
  })
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  let myresult = []
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(function (result) {myresult = result; return (console.log(result))});
  function loadEmail(props) {
    return (
      <div class="emaildiv">
        <p style="text-align:left;">
          <bold>{props.sender}</bold>
        </p>
        <p>
          {props.subject}
        </p>
        <p style="text-align:right;">
          {props.timestamp}
        </p>
      </div>
    );
  }
  for (let i = 0; i < myresult.length; i++) {
    <loadEmail sender={myresult[i].sender} subject={myresult[i].subject} timestamp={myresult[i].timestamp} />    
  }
  return (console.log(myresult));
}