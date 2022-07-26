document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  document.querySelector('#compose-submit').addEventListener('click', function () { 
    console.log("*********** SUBMIT **********");
    recipients = document.querySelector('#compose-recipients').value;
    subject = document.querySelector('#compose-subject').value;
    body = document.querySelector('#compose-body').value;
    body = body.replaceAll('\n', '<br>');
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
    })
    .then(() => load_mailbox('sent'));
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  console.log("########### compose_email ############");
  console.log("Newemail being created");
  //if (reply === undefined) {
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  //}
  //else {
    //reply = true;
  //}
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  /*
  document.querySelector('#compose-submit').addEventListener('click', function () { 
    console.log("*********** SUBMIT **********");
    recipients = document.querySelector('#compose-recipients').value;
    subject = document.querySelector('#compose-subject').value;
    body = document.querySelector('#compose-body').value;
    body = body.replaceAll('\n', '<br>');
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
    
    })
    .then(() => load_mailbox('inbox'));
  });*/
}

function load_mailbox(mailbox) {
  clear();
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
      emaildiv.classList.add('emaildiv');
      emaildiv.addEventListener('click', function() {
          console.log(`Opening email ${result[i]['id']}`);
          open_post(result[i]['id'], mailbox);
          clear();

    });
    fetch('/emails/'+result[i]["id"])
    .then(response => response.json())
    .then(function (email){
      if (email.read===false){
        emaildiv.classList.add('unread');
      }
      console.log(email);
    })
    //const emaildivtext = document.createElement('p');
    //emaildivtext.innerHTML = result[0]['sender'];
    document.querySelector('#emails-view').append(emaildiv);
    }
  });
  return false;
}

function open_post(id, mailbox) {
  let mailboxes = ['inbox', 'sent', 'archived'];
  document.querySelector('#sender').innerHTML = '<b>From: </b>';
  document.querySelector('#reciever').innerHTML = '<b>To: </b>';
  document.querySelector('#subject').innerHTML = '<b>Subject: </b>';
  document.querySelector('#timestamp').innerHTML = '<b>Timestamp: </b>';
  document.querySelector('#body').innerHTML = '';
  document.querySelector('#buttons').innerHTML = '';
  clear();
  document.querySelector('#emails-view').innerHTML = '';
  clear();
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  let myemail = {};
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(function(result) {
    myemail = result
    const sender = document.createTextNode(String(result['sender']));
    document.querySelector('#sender').appendChild(sender);

    const reciever = document.createTextNode(String(result['recipients']));
    document.querySelector('#reciever').appendChild(reciever);

    const subject = document.createTextNode(String(result['subject']));
    document.querySelector('#subject').appendChild(subject);

    const timestamp = document.createTextNode(String(result['timestamp']));
    document.querySelector('#timestamp').appendChild(timestamp);
    
    body = document.querySelector('#body').innerHTML = String(result['body']);

    if (mailbox != 'sent'){
      archivebtn = document.createElement('button');
      archivebtn.className = 'btn btn-sm btn-outline-primary';
      document.querySelector('#buttons').appendChild(archivebtn);
      fetch('/emails/'+id)
      .then(response => response.json())
      .then(email => console.log(email))
      .then(function (){
       console.log(myemail.archived===true);
       if (myemail.archived===false){
        archivebtn.innerHTML = 'Archive';
      }
      else if (myemail.archived===true){
        archivebtn.innerHTML = 'Unarchive';
      }
      })
      
      archivebtn.addEventListener('click', function () {
        fetch('/emails/'+id)
        .then(response => response.json())
        .then(function (email) {
          // Print email
          myemail = email;
          console.log(email);
        })
        .then(function (){
          if (myemail["archived"] == true){
            fetch('/emails/'+id, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            })
            .then(function(){
              archivebtn.innerHTML = 'Archive';
              clear();
              return load_mailbox('inbox');
            })
          }
          else {
            fetch('/emails/'+id, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            })
            .then(function(){
              archivebtn.innerHTML = 'Unarchive';
              clear();
              return load_mailbox('inbox');
            })
          }
        })
        //return load_mailbox('inbox')
    });

  };
  });

  fetch('/emails/'+id, {
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
  replybtn = document.createElement('button');
  replybtn.className = 'btn btn-sm btn-outline-primary';
  document.querySelector('#buttons').appendChild(replybtn);
  replybtn.innerHTML = 'Reply';
  replybtn.addEventListener('click', function(){
    compose_email();
    console.log("reply has been clicked!");
    document.querySelector('#compose-recipients').value = myemail.sender;
    if (myemail.subject.slice(0, 2) != 'Re'){
      document.querySelector('#compose-subject').value = 'Re: '+myemail.subject;
    }
    else {
      document.querySelector('#compose-subject').value = myemail.subject;
    }
    body = myemail.body;
    body = body.replaceAll('<br>', '\n');
    document.querySelector('#compose-body').value = `On ${myemail.timestamp} ${myemail.sender} wrote:\n${body}`;
    //compose_email(true);  
  });  
  for (let i = 0; i < 3; i++){
    document.querySelector('#' + mailboxes[i]).addEventListener('click', function (){
      document.querySelector('#sender').innerHTML = '<b>From: </b>';
      document.querySelector('#reciever').innerHTML = '<b>To: </b>';
      document.querySelector('#subject').innerHTML = '<b>Subject: </b>';
      document.querySelector('#timestamp').innerHTML = '<b>Timestamp: </b>';
      document.querySelector('#body').innerHTML = '';
      document.querySelector('#buttons').innerHTML = '';
    });
  }
}

function clear() {
  document.querySelector('#emails-view').innerHTML = '';
  return true;
}