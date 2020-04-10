$(document).on("click", "#submitComment", () => {
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "/article/comments/" + thisId,
        data: {
            title: $("#name").val(),
            body: $("#comments").val()
        }
    }).then(data => {
        console.log(data);
        $("#name").val("");
        $("#comments").val("");
    })
})