var checkout;

$('.live-demo-button').on('click', function (e) {
    e.preventDefault();
    checkout.open();
});


(function check(self) {
    setTimeout(function() {
        if ($('script[src="https://checkout.rbk.money/checkout.js"]')) {
            initCheckout('sUFLuTavi4', 'eyJhbGciOiJFUzI1NiIsImtpZCI6IllKSWl0UWNNNll6TkgtT0pyS2s4VWdjdFBVMlBoLVFCLS1tLXJ5TWtrU3MiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImFudG9uLmx2YUBnbWFpbC5jb20iLCJleHAiOjAsImp0aSI6InNVRkx2eEhPcjIiLCJuYW1lIjoiQW50b24gS3VyYW5kYSIsInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBhcnR5LiouaW52b2ljZV90ZW1wbGF0ZXMuc1VGTHVUYXZpNC5pbnZvaWNlX3RlbXBsYXRlX2ludm9pY2VzOndyaXRlIiwicGFydHkuKi5pbnZvaWNlX3RlbXBsYXRlcy5zVUZMdVRhdmk0OnJlYWQiXX19LCJzdWIiOiJmNDI3MjNkMC0yMDIyLTRiNjYtOWY5Mi00NTQ5NzY5ZjFhOTIifQ.23zeJum41PbKd4_p4xg4v7ITNZDjeI72hK3cI5_MbZ8czforsPCYca8yiC9v5dfLeAiKKXxE8Ks-_HowY1EeWA');
        } else {
            check(self);
        }
    }, 300);
})(this);


function initCheckout(templateID, templateAccessToken) {
    checkout = RbkmoneyCheckout.configure({
        invoiceTemplateID: templateID,
        invoiceTemplateAccessToken: templateAccessToken,
        name: 'RBKmoney Developer Portal',
        description: 'Developer Portal Demo',
        finished: function () {
            location.reload();
        },
        opened: function() {
            $('body').css('overflow', 'hidden');
        },
        closed: function() {
            $('body').css('overflow', 'auto');
        }
    });
}