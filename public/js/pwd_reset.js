
  var allowSubmit = false;
  function validate() {
      var current_password=$('input[name=current_password]').val();
      var password =$('input[name=password]').val();
      var password1 =$('input[name=password1]').val();
      
    
      if(current_password.length==0) {
        error_msg("Previous Password Required to reset");
        return false;
      }
       else if(current_password.length<8) {
        error_msg("Password must contain 8 or more characters");
        return false;
          }
          else if(password.length==0) {
            error_msg("Please enter new password");
            return false;
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
    
   
    function error_msg(error)
    {
      $("#client-error").addClass("alert alert-danger text-center");
      $("#client-error").text(error);
      return
    }
  
  
   
    $("form#pwd_reset").on('submit', function(e){
      
      if (!allowSubmit) {
          e.preventDefault();
      
          validate() ;
      }
     
  });
  
  