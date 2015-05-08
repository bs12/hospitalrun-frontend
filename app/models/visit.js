import AbstractModel from "hospitalrun/models/abstract";
import Ember from "ember";

export default AbstractModel.extend({
    additionalDiagnoses: DS.attr(), //Yes, the plural of diagnosis is diagnoses!
    clinic: DS.attr('string'),
    charges: DS.hasMany('proc-charge'),
    dischargeInfo: DS.attr('string'),
    endDate:  DS.attr('date'),  //if visit type is outpatient, startDate and endDate are equal 
    examiner: DS.attr('string'),
    history: DS.attr('string'),
    historySince: DS.attr('string'), //History since last seen
    imaging: DS.hasMany('imaging', {async: true}),
    labs: DS.hasMany('lab', {async: true}),
    location: DS.attr('string'),
    medication: DS.hasMany('medication', {async: true}),
    notes: DS.attr('string'),
    outPatient: DS.attr('boolean'),
    patient: DS.belongsTo('patient'),
    primaryDiagnosis: DS.attr('string'), //AKA admitting diagnosis
    primaryBillingDiagnosis: DS.attr('string'), //AKA final diagnosis
    primaryBillingDiagnosisId: DS.attr('string'),
    procedures: DS.hasMany('procedure', {async: true}),
    startDate:  DS.attr('date'),
    status: DS.attr('string'),
    visitType: DS.attr(),        
    vitals: DS.hasMany('vital', {async: true}),
    
    diagnosisList: function() {
        var additionalDiagnosis = this.get('additionalDiagnoses'),
            diagnosisList = [],
            primaryDiagnosis = this.get('primaryDiagnosis');
        if (!Ember.isEmpty(primaryDiagnosis)) {
            diagnosisList.push(primaryDiagnosis);
        }
        if (!Ember.isEmpty(additionalDiagnosis)) {
            diagnosisList.addObjects(additionalDiagnosis.map(function(diagnosis) {
                return diagnosis.description;
            }));
        }
        return diagnosisList;
    }.property('additionalDiagnosis@each','primaryDiagnosis'),
            
    visitDate: function() {
        var endDate = this.get('endDate'),
            startDate = moment(this.get('startDate')),
            visitDate = startDate.format('l');
        if (!Ember.isEmpty(endDate) && !startDate.isSame(endDate, 'day')) {
            visitDate += ' - ' + moment(endDate).format('l');                                                
        }
        return visitDate;
    }.property('startDate', 'endDate'),
    
    visitDescription: function() {
        var visitDate = this.get('visitDate'),
            visitType = this.get('visitType');
        return '%@ (%@)'.fmt(visitDate, visitType);
    }.property('visitDate', 'visitType'),
    
    validations: {
        endDate: {
            acceptance: {
                accept: true,
                    if: function(object) {
                        if (!object.get('isDirty')) {
                            return false;
                        }
                        var startDate = object.get('startDate'),
                            endDate = object.get('endDate');
                        if (Ember.isEmpty(endDate) || Ember.isEmpty(startDate)) {
                            //Can't validate if empty
                            return false;
                        } else {
                            if (endDate.getTime() <  startDate.getTime()) {
                                return true;
                            }
                        }
                        return false;
                    }, 
                message: 'Please select an end date later than the start date'
            }
        },
        
        startDate: {
            presence: true
        },
        visitType: {
            presence: true
        }
        
    }

});