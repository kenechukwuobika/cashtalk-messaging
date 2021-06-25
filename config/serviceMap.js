const config = require('./app');
const {
    crmMsUrl,
    approvalMsUrl,
    messageMsUrl
} = config;

// todo: This will be changed to docker environment variable.
// let approvalMsPort = '5004';
// let approvalMsIpAddress = 'http://127.0.0.1';

// let crmMsPort = '5002';
// let crmMsIpAddress = 'http://127.0.0.1';

// let messageIpAddress = 'http://35.178.245.12';


module.exports={
    getOneContactUrl: `${crmMsUrl}/cloudenly/crm/v1/contact/one`,
    checkPricebookAccessPermission: `${crmMsUrl}/cloudenly/crm/v1/contact/expose/check`,
    getOneLoyaltyScheme: `${crmMsUrl}/cloudenly/crm/v1/loyalty-scheme/one`,
    getLoyaltySchemeContacts: `${crmMsUrl}/cloudenly/crm/v1/loyalty-scheme/contacts`,
    sendEmailMessage: `${messageMsUrl}/api/mail/send`,
    
    approvalMs: {
        route: {
            getTaskBySlug: `${approvalMsUrl}/cloudenly/approval/v1/task/slug`,
            sendForApproval: `${approvalMsUrl}/cloudenly/approval/v1/approval/send-for-approval`,
            objectRequiringMyApproval: `${approvalMsUrl}/cloudenly/approval/v1/approval/check-object-requiring-my-approval`,
            objectIHaveApproved: `${approvalMsUrl}/cloudenly/approval/v1/approval/get-object-i-have-approve`
        }
    },
    crmMs: {
        route: {
            managePipelineMovement: `${crmMsUrl}/cloudenly/crm/v1/pipeline/movement`,
            getContactByEmail: `${crmMsUrl}/cloudenly/crm/v1/contact`,
            getOneContactUrl: `${crmMsUrl}/cloudenly/crm/v1/contact/one`,
            checkPricebookAccessPermission: `${crmMsUrl}/cloudenly/crm/v1/contact/expose/check`,
            getOneLoyaltyScheme: `${crmMsUrl}/cloudenly/crm/v1/loyalty-scheme/one`,
            getLoyaltySchemeContacts: `${crmMsUrl}/cloudenly/crm/v1/loyalty-scheme/contacts`
        }
    },
    messageMs: {
        route: {
            sendEmailMessage: `${messageMsUrl}/api/mail/send`
        }
    }
};
