var Util = require('Utilities');
var resultCode;
var translationTag;
var component;
var strTmpCCD;
var strMessageName;
var strSendingFacility;
var translationCode = new Array();
var obsCode = new Array();
var obsDisplayName = new Array();
var transCode = new Array();
var obsValue = new Array();
var effectTimeValue= new Array();
var codeSysName = new Array();



for (var i = 0; i < input.length; i++) {
	log.debug('Looping through messages...');
    var nextMsg = output.append(input[i]);
	var hapiMsg = nextMsg.getHapiMessage();
	strSendingFacility = nextMsg.getProperty('SendingFacility');
	strMessageName = nextMsg.getProperty('MessageName');
    if(strMessageName == 'MDMT02' && strSendingFacility == 'SHFT'){
			log.debug('Shaftsbury MDM detected...');
			var msgControlID = nextMsg.getField('MSH/MessageControlID');
			//CCD content at OBX-5.5.1
			var b64CCD = hapiMsg.getValue('OBX',0,5,0,1,1);
			
			
			strTmpCCD = new XML(decodeBase64(b64CCD));			
			
			//write decoded original CCD to log
			//log.debug(strTmpCCD);
			
			//test lookup
			var hemoCode = lookup('Shaftsbury_Translations' ,"Result_Display_Name", 'HEMATOCRIT');
			
			log.debug('Hematocrit lookup code: '+hemoCode.LOINC_CODE);
			
			default xml namespace = "urn:hl7-org:v3";
			component = strTmpCCD.component.structuredBody.component;
			
			for(var j=0; j< component.length(); j++){
				resultCode = component[j].section.code.@code;
				
				///ClinicalDocument/component/structuredBody/component/section/code
				if(resultCode=='30954-2'){
					log.debug('Codes in Results Section: '+component[j].section.entry.length());
						for(var k=0;k<component[j].section.entry.length(); k++){									
							///ClinicalDocument/component/structuredBody/component/section/entry/organizer/component/observation/code/@displayName
							obsDisplayName = component[j].section.entry[k].organizer.component.observation.code.@displayName;
							log.debug(obsDisplayName);
							if(lookup('Shaftsbury_Translations' ,"Result_Display_Name", obsDisplayName)){
								translationCode = lookup('Shaftsbury_Translations' ,"Result_Display_Name", obsDisplayName);
								log.debug(translationCode.LOINC_CODE);														
								//translationTag = <code = {translationCode.LOINC_CODE} codeSystem="2.16.840.1.113883.6.1" displayName={translationCode.OBS_DESCRIPTION} codeSystemName="LOINC"/>
							component[j].section.entry[k].organizer.component.observation.code.@code = translationCode.LOINC_CODE;
							//log.debug(component[j].section.entry[k].organizer.component.observation.code.@code);
							component[j].section.entry[k].organizer.component.observation.code.@codeSystem = "2.16.840.1.113883.6.1";
							component[j].section.entry[k].organizer.component.observation.code.@displayName = translationCode.OBS_DESCRIPTION;
							component[j].section.entry[k].organizer.component.observation.code.@codeSystemName = "LOINC";
								transCode[k] = translationCode.LOINC_CODE;
							}
						}

				}
			}
			
			//write CCD with translations to log
			log.debug(strTmpCCD);
			
			var transformedCCD = encodeBase64(strTmpCCD.toXMLString());
			
			transformedCCD = Util.replaceAll(transformedCCD,'\r\n','');
			//log.debug(transformedCCD);
			
			// put the base64 encoded CCD with the translations back to the MDM wrapper
			
			hapiMsg.setValue('OBX',0,5,0,5,1,transformedCCD);
			nextMsg.text = hapiMsg.getOutput();			
			
			
	}			
	
}
