/*
 * Validate - form validation for Bootstrap, jQuery, Ajax & PHP
 * 
 * Copyright 2013 Michael Bignold
 * MIT Licence
 * 
 * https://github.com/cthiggo/validate
 * 
 * 
 */


/*
 * Intialization
 */

    /*
     *  Variables, change as required
     */
    sAjaxPath = 'validate.php';
    sErrorTextColour = '#b94a48';
    sErrorBorderColour = '#b94a48';
    sSuccessTextColour = '#468847';
    sSuccessBorderColour = '#468847';

    /*
     *  Set the property [data-vfunc] on the submit button and it will execute that function on submit, rather than submit the form.
     */
    function doSomething() {
        alert('You have completed all inputs as required, and have submitted!');
        console.log('You have completed all inputs as required, and have submitted!');
    }



    $(function() {

        //Event Listeners
        $('*[data-vreq],*[data-vtype]').focusout(function() {
            validate.input($(this));
        });

        $('select.chosen[data-vreq]').on('change', function() {
            validate.input($(this));
        });

        $('*[data-vsubmit]').on('click', function() {
            validate.submit($(this).closest('form'), $(this));
        });


        //CSS Styling
        var sStyle = "<style type='text/css'>"
                + ".tooltip { position: fixed; z-index:10000000; }"
                + "input[type=text].vwarning, input[type=password].vwarning, textarea.vwarning, select.vwarning, .vwarning { border: 1px solid " + sErrorBorderColour + "; color: " + sErrorTextColour + "; }"
                + "input[type=text].vincomplete, input[type=password].vincomplete, textarea.vincomplete, select.vincomplete, .vincomplete { border: 2px solid " + sErrorBorderColour + "; color: " + sErrorTextColour + "; }"
                + "input[type=text].vsuccess, input[type=password].vsuccess, textarea.vsuccess, select.vsuccess, .vsuccess { border: 1px solid " + sSuccessBorderColour + "; color: " + sSuccessTextColour + "; }"
                + "</style>";
        $(sStyle).appendTo('head');
        console.log('This page uses Validate form validation - https://github.com/cthiggo/validate');
    });


validate = {
    
    //Variables:
    sAjaxPath: sAjaxPath,
            
            
    submit: function(oForm, oBtn){
        //prevent form submission
        oForm.submit(function(e) { e.preventDefault(); return false; });
        
        //submit the form or call function 
        var fnSuccess = (!empty(oBtn.attr('data-vfunc'))) ? function(){ window[oBtn.attr('data-vfunc')](oForm); } : function() { oForm.submit(); };
        
        validate.clearFormStatus(oForm);
        validate.form(
            oForm,
            function(oForm){
                if(!empty(fnSuccess)) fnSuccess(oForm);
                if(!empty(oBtn.attr('data-vclear'))) validate.clearFormValues(oForm);
            },
            function(){
                alert('Form is incomplete.');
                console.log('Form is incomplete.');
                return false;
            });
            
        return false;
    },
    
    form: function(oForm, fnSuccess, fnFailure){
        var oAllInputs = oForm.find('input, textarea, select').filter('[id]');
        var oLastInput = oAllInputs.filter(':last');
        
        oAllInputs.each(function(){
            if(!$(this).hasClass('vsuccess') && !$(this).hasClass('vwarning') && !$(this).hasClass('vincomplete')){
                validate.input($(this), function(oInput){
                    validate.form(oForm, fnSuccess, fnFailure);
                });
                return false;
            } else if(oLastInput.get(0) === this){ //check if input is the last input
                if(validate.isFormSuccess(oForm) === true){ //if every input has success classes
                    fnSuccess(oForm); //submit form
                } else {
                    validate.setIncomplete(oForm); //sets all warning classes to incomplete instead to make it more bold
                    fnFailure();
                }
                return false;
            }
            return true; //skip to next input if it has a class already and is not the last input
        });
    },
            
    input: function(oInput, fnCallback){
        if(!empty(oInput.val())){
            if(!empty(oInput.attr('data-vtype'))){
                validate.ajax(oInput.val(), oInput.attr('data-vtype'), 
                    function(sResponse){
                        validate.setStatus(oInput, 'success');
                        if(!empty(fnCallback)) fnCallback(oInput);
                    }, 
                    function(sResponse){
                        validate.setStatus(oInput, 'warning', sResponse);
                        if(!empty(fnCallback)) fnCallback(oInput);
                    }
                );
                return false; //callback is delegated to the ajax function
            } else {
                validate.setStatus(oInput, 'success');
                if(!empty(fnCallback)) fnCallback(oInput);
                return false;
            }
        } else {
            if(!empty(oInput.attr('data-vreq'))){
                validate.setStatus(oInput, 'warning', 'This is a required field.');
                if(!empty(fnCallback)) fnCallback(oInput);
                return false;
            } else {
                validate.setStatus(oInput, 'success');
                if(!empty(fnCallback)) fnCallback(oInput);
                return false;
            }
        }
    },
            
    ajax: function(sValue, sType, fnSuccess, fnFailure){
        $.post(validate.sAjaxPath, {vtype: sType, vvalue: sValue})
         .done(function(sResponse) {
            if (sResponse != '1') {
                fnFailure(sResponse);
                return false;
            } else {
                fnSuccess(sResponse);
                return false;
            }
         })
         .fail(function(sError){
            fnFailure('Ajax error.');
            return false;
         });
    },
            
    setStatus: function(oInput, sStatus, sMessage){
        if (oInput.is('select') && oInput.hasClass('chosen')) {
            validate.chosenFix(oInput, function(oChosenInput) {
                validate.setStatus(oChosenInput, sStatus, sMessage);
            });
        }
        validate.clearInputStatus(oInput);
        if(sMessage) oInput.tooltip({'title': sMessage, 'trigger': 'focus'});    
        oInput.addClass('v' + sStatus);
        return false;
    },
            
    setIncomplete: function(oForm){
        oForm.find(':input.vwarning').each(function(){
            $(this).removeClass('vwarning');
            $(this).addClass('vincomplete');
            var ph = $(this).attr('placeholder');
            if(!empty(ph)){
                var newPh = (ph.indexOf('(Required)') < 0) ? ph + " (Required)" : ph;
                $(this).attr('placeholder', newPh);
            }
        });
        //for chosen select boxes
        oForm.find('.chosen-container.vwarning').each(function(){
            $(this).removeClass('vwarning');
            $(this).addClass('vincomplete');
            var ph = $(this).find('a.chosen-default span').text();
            if(!empty(ph)){
                var newPh = (ph.indexOf('(Required)') < 0) ? ph + " (Required)" : ph;
                $(this).find('a.chosen-default span').text(newPh);
            }
        });
    },
            
    clearInputStatus: function(oInput){
        oInput.removeClass('vsuccess');
        oInput.removeClass('vwarning');
        oInput.removeClass('vincomplete');
        oInput.tooltip('destroy');
        return false;
    },
            
    clearFormStatus: function(oForm){
        oForm.find(':input').each(function(){
            validate.clearInputStatus($(this));
        });
    },
            
    clearFormValues: function(oForm){
        oForm.find(':input').each(function(){
            $(this).val('');
        });
        validate.clearFormStatus(oForm);
    },
            
    isFormSuccess: function(oForm){
        var bSuccessful = true;
        oForm.find(':input').each(function(){
            if(!empty($(this).attr('id')) && !$(this).hasClass('vsuccess')) bSuccessful = false;
        });
        return bSuccessful;
    },
            
    chosenFix: function(oInput, fnCallback){
        var oChosenInput = $('#' + oInput.attr('id') + "_chosen");
        fnCallback(oChosenInput);
    }
};




/*
 * empty()
 *  @desc: tests if a string is empty or null etc
 *  @params:    sString, string
 */
function empty(sString)
{
    sString = $.trim(sString);
    if (typeof sString === 'undefined' || sString === 'NaN' || sString === null || sString == '' || sString === false || sString == 'false' || sString == '0' || sString === 0) {
        return true;
    } else {
        return false;
    }
}


/*
 * cont()
 * @desc: returns true if needle found in haystack, false if not
 * @params:  sNeedle, string
 *           sHaystack, string
 */
function cont(sNeedle, sHaystack) {
    if (sHaystack.indexOf(sNeedle) > -1) {
        return true;
    } else {
        return false;
    }
}


/*
 * dump()
 * @desc: displays all the values of an object or array
 * @params: obj, object
 */
function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }
    console.log(out);
    //alert(out);
}