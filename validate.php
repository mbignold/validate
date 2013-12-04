<?php

/**
 * validation.php
 * 	This is the validation class that could easily be used to validate 
 *   against a database, ie: checking if a username is taken, or if an email is already registered
 *   to provide real-time validation that is much more convenient than purely server-side
 *   validation that requires the user to submit a form first.
 *
 */
 
$vtype = $_REQUEST['vtype'];
$vvalue = $_REQUEST['vvalue'];
$validation = new Validation;
$validation->validate($vtype, $vvalue);

class Validation
{
    
    private $email,
			$phone_CA,
			$postal_CA;

    function __construct() 
	{
		$this->email = '/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/'; 
		$this->phone_CA = '/^(\+?)(1?)(\-?)(\s?)(\.?)(\(?)[2-9][0-9][0-9](\)?)(\-?)(\s?)(\.?)(([2-9][2-9][2-9])|([2-9][0-9]([2-9]|0))|([2-9]([2-9]|0)[0-9]))(\-?)(\s?)(\.?)[0-9]{4}$/';  //Canadian phone numbers
		$this->postal_CA = '/^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1}(\-?)(\s?)(\.?)\d{1}[A-Z]{1}\d{1}$/i';  //Canadian postal code
		
		/* Others
        $this->rNameSingle = '/^[A-Za-zéÉçÇüÜäÄëËèÈûÛÏïöÖîÎàÀáÁâÂßêÊøØåÅ\-\']+$/'; //one name/word only
		$this->rName = '/^([A-Za-zéÉçÇüÜäÄëËèÈûÛÏïöÖîÎàÀáÁâÂßêÊøØåÅ\-\']+)([\sA-Za-zéÉçÇüÜäÄëËèÈûÛÏïöÖîÎàÀáÁâÂßêÊøØåÅ\-\']+)+$/'; //either one name, or any multiple of names
		$this->rNameFull = '/^([A-Za-zéÉçÇüÜäÄëËèÈûÛÏïöÖîÎàÀáÁâÂßêÊøØåÅ\-\']+)\s([A-Za-zéÉçÇüÜäÄëËèÈûÛÏïöÖîÎàÀáÁâÂßêÊøØåÅ\-\'\s]+)+$/'; //at least two names, separated by a space, with unlimited middle names
		*/
    }
    
    function validate($_type, $_value)
    {
        switch ($_type) 
        {
            case 'phone_CA':
                if($_value = preg_match($this->phone_CA, $_value))
                   echo 1;
                 else 
                   echo "Please enter a valid phone number.";
               break;
               
            case 'email':
                if($_value = preg_match($this->email, $_value))
                   echo 1;
                 else 
                   echo "Please enter a valid email.";
               break;
               
            case 'postal_CA':
                if($_value = preg_match($this->postal_CA, $_value))
                   echo 1;
                 else 
                   echo "Please enter a valid postal code.";
               break;
        }
		die;
    }

}