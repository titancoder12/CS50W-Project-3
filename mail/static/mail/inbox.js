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
  clear();
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-submit').addEventListener('click', function () { 
    recipients = document.querySelector('#compose-recipients').value;
    subject = document.querySelector('#compose-subject').value;
    body = document.querySelector('#compose-body').value;
    console.log(body);
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
    return true;
  })
}

function load_mailbox(mailbox) {
  document.querySelector('#emails-view').value = '';
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  clear();
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><hr>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(function(result) {
  //result = result.reverse();
  for (let i = 0; i < result.length; i++){
      //mailboxdiv = document.querySelector('#emails-view');
      const emaildiv = document.createElement('div');
      emaildiv.innerHTML = `<p style="display: inline; white-space: nowrap;"><b>${result[i]['sender']}</b>    ${result[i]['subject']}</p><p style='color: gray; text-align:right;'>${result[i]['timestamp']}</p><hr>`;
      emaildiv.className = 'emaildiv';
      emaildiv.addEventListener('click', function() {
          console.log(`Opening email ${result[i]['id']}`);
          open_post(result[i]['id'], mailbox);
          clear();

      });
      //const emaildivtext = document.createElement('p');
      //emaildivtext.innerHTML = result[0]['sender'];
      document.querySelector('#emails-view').append(emaildiv);
    }
  });
  
}

function open_post(id, mailbox) {
  clear();
  document.querySelector('#emails-view').innerHTML = '';
  clear();
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(function(result) {
    const sender = document.createTextNode(String(result['sender']));
    document.querySelector('#sender').appendChild(sender);

    const reciever = document.createTextNode(String(result['recipients']));
    document.querySelector('#reciever').appendChild(reciever);

    const subject = document.createTextNode(String(result['subject']));
    document.querySelector('#subject').appendChild(subject);

    const timestamp = document.createTextNode(String(result['timestamp']));
    document.querySelector('#timestamp').appendChild(timestamp);
    if (mailbox != sent || mailbox != archived){
      archivebtn = document.createElement('button');
      archivebtn.className = 'btn btn-sm btn-outline-primary';
      archivebtn.innerHTML = 'Archive';
      document.querySelector('#buttons').appendChild(archivebtn);
      archivebtn.addEventListener('click', function () {
        fetch(`emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archive: true
          })
        });
      });
    }

    document.querySelector('#body').innerHTML = String(result['body']);
  })
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
  //const sent = document.querySelector('#sent');
  //const archive = document.querySelector('#archive');
  //const inbox = document.querySelector('#inbox');
  //let i = 0;
  //let mailboxes = ['sent', 'archive', 'inbox']
  //[sent, archive, inbox].forEach((element)=>{
    //element['selector'].addEventListener('click', function () {
  let mailboxes = ['inbox', 'sent', 'archived'];
  let mailbox_load_name = ['inbox', 'sent', 'archive'];

  for (let i = 0; i < 3; i++){
    document.querySelector('#' + mailboxes[i]).onclick = function (){
      document.querySelector('#sender').innerHTML = '<b>From: </b>';
      document.querySelector('#reciever').innerHTML = '<b>To: </b>';
      document.querySelector('#subject').innerHTML = '<b>Subject: </b>';
      document.querySelector('#timestamp').innerHTML = '<b>Timestamp: </b>';
      document.querySelector('#body').innerHTML = '';
      document.querySelector('#buttons').innerHTML = '';
      clear();
      load_mailbox(mailbox_load_name[i]);
    };
  }
}

function clear() {
  document.querySelector('#emails-view').innerHTML = '';
  return true;
}