
  var allowSubmit = false;
function validate() {
    var name=$('input[name=name]').val();
    var email =$('input[name=email]').val();
    var password =$('input[name=password]').val();
    var password1 =$('input[name=password1]').val();
    
  
    if(name.length<6) {
      error_msg("Username must contain 6 or more characters");
      return false;
    }
    
    else if(!isAllowed(name)) {
      error_msg("Username contains invalid characters");
      return false;
    }
  
      
    else if(!isNaN(name[0])) {
      error_msg("Username cannot start with a digit");
      return false;
    }
    else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)))
      {
        error_msg("pleas enter valid Email address ");
      }
    else if(password.length<8) {
        error_msg("Password must contain 8 or more characters");
        return false;
      }

      else if(password!=password1) {
        error_msg("please enter the correct password");
        return false;
      }
    else {
      
     allowSubmit = true;
    }
     
  }
  
  function isAllowed(string) {
    var i, code;
  
    for(i=0; i<string.length; i++) {
      code = string.charCodeAt(i);
      if(!(code > 47 && code < 58) && 
        !(code > 64 && code < 91) && 
        !(code > 96 && code < 123) &&
        !(code == 95)) { // '_'
        return false;
      }
    }
  
    return true;
  }
  function error_msg(error)
  {
    $("#client-error").addClass("alert alert-danger text-center");
    $("#client-error").text(error);
    return
  }


 
  $("form#signup").on('submit', function(e){
    
    if (!allowSubmit) {
        e.preventDefault();
    
        validate() ;
    }
   
});

