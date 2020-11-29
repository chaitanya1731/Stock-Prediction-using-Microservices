const URL = `http://104.198.35.242:3000`;
const users = {};

document.getElementById('username').addEventListener('focusout', checkUserExist);

function checkUserExist(){
  try{
    const entry = $("#username").val();
    $("#usernameError").html("");
    if(String(entry).length > 0) {
      var found = Object.keys(users).filter(function(key) {
        return users[key]["Firstname"] === entry;
      });

      if(found.length === 0){
        $("#usernameError").html(`User ${entry} does not exist`);
      }
    }
  }
  catch(err){
    console.log(err);
      throw(err);
  }
}

function submitForm(username){
  try{
    const entry = $("#username").val();
    if(String(entry).length > 0) {
      console.log(users);
      var found = Object.keys(users).filter(function(key) {
        return users[key]["Firstname"] === username;
      });

      if(found.length){
        window.location = `../views/userDetails.html?Firstname=${entry}`;
      }
      else{
        $("#usernameError").html(`User ${username} does not exist`);
      }
      event.preventDefault();
    }

  }
  catch (err) {
      console.log(err);
      throw(err);
  }
}

$.ajax({
    type: "GET",
    url: `${URL}/getStocks`,
    // data: {"type": "check"},
    dataType: "json",
    success: function(response){
        // console.log(response);
        Object.assign(users, response)
        let html="";
        let i=1;
        response.forEach(item => {
          html+=`<tr>`;
          html+=`<th scope="row">${i}</td>`;
          html+=`<td><a href="./userDetails.html?Firstname=${item.Firstname}">${item.Firstname} ${item.Lastname}</a></td>`;
          // html+=`<td>${item.Lastname}</td>`;
          html+=`</tr>`;
          i++;
        });
        $("#usersTable > tbody").append(html);
    }
});