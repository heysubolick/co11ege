function selected_article(pt_seq){
    window.location.href="/groupBoardlist?pt_seq="+pt_seq;
}

function selectedItem(pt_seq,ch_email){
    alert("success:"+pt_seq+"  "+ch_email);
}

$(document).ready(function(){
    //비디오 클릭
    $(document).delegate('.choicevideo', 'click', function(){
        width = $(this).width();
        if (width < 300){
            $(this).css('width', '500px');
            $(this).css('height', '450px');
        }else{
            $(this).css('width', '140px');
            $(this).css('height', '120px');
        }
    });

    $('#fileuploadbtn').on('click',function(){
        form = $('#textfileuploadform')
        // Trigger HTML5 validity.
        var reportValidity = form[0].reportValidity();
        // Then submit if form is OK.
        if(reportValidity){
            form.submit();
            var progressbar = $('#progressbar'),
            max = progressbar.attr('max'),
            time = (300/max)*5,
            value = progressbar.val();

            var loading = function() {
            value += 0.1;
            addValue = progressbar.val(value);

            $('.progress-value').html(value + '%');

            if (value == max) {
            clearInterval(animate);
            }
            };

            var animate = setInterval(function() {
            loading();
            }, time);
        }
    });

    $('#example').dataTable({
          "ordering": false
    });

    $('#grouptable').dataTable({
          "ordering": false
    });
    $("#grouptable_filter").remove();

    var appendbtn= $('<button type="button" id="autogroupdiv" class="ui primary button" style="float:right"><i class="fas fa-registered"></i>팀자동생성</button>');
    $('#grouptable_length').prepend(appendbtn);

    $('#autogroupdiv').on('click',function(){
        location.href="/autogroupdivide/";
    });

    $('#teampeople').on('change',function(){
		var allpeople = $('#allpeople').val();
		var teampeople = $('#teampeople').val();
		var team = parseInt(allpeople / teampeople)+"";
		var remain = allpeople % teampeople;
		var result = team.concat(".").concat(remain);
		$('#teams').val(result);
	});


    $(document).on('click','#example td #memberupdaterow',function(){
        var row = $(this).closest('tr');
		var td = row.children();
		var email = td.eq(0).text();
		var level =  td.eq(6).children().children().val();
        $.ajax({
           url: '/memberupdateAjax/',
           data: {'email' : email,'level':level},
           type: 'POST',
           success: function(response) {
               $("#successmessage").css("display", "block")
               .delay(1200).queue(function(){
                    $("#successmessage").css("display", "none").dequeue();
               });
           },
           error: function(error) {

           }
        });
    });

    var hidden_pt_seq; //public variable



    $('.teamlistbtn').on('click',function(){
        $('#board_left_detail').text('');
        var row = $(this).closest('label');
        var td = row.children().next('div').children();
        var pt_seq = td.eq(0).val();
        $('.article_view_btn').css('display','block');  //article list button show
        $('.selected_article').val(pt_seq); //when article btn click then set parent seq
        $.ajax({
           url: '/childclickshowAjax/',
           data: {'pt_seq' : pt_seq},
           type: 'POST',
           success: function(rows) {
                for (i=0; i<rows.length; i++){
                    name = rows[i][3];
                    append_str = "<div class='ui row' style='margin-top:2px;'>"+name+"</div>";
                    $('#board_left_detail').append(append_str);
                }
           },error: function(error) {
           }
        });
    });

    $('.appendstudentteam').on('click',function(){
        var row = $(this).closest('label');
        var td = row.children().next('div').children();
        var pt_seq = td.eq(0).val();
        var pt_authemail = td.eq(1).val();
        var authname = td.eq(2).val();
        $('#childelementtr').remove();
        $.ajax({
           url: '/childGetListAjax/',
           data: {'pt_seq' : pt_seq,'pt_authemail':pt_authemail},
           type: 'POST',
           success: function(rows) {
                $('#groupboardheard').text('계설자 : '+authname);
                hidden_pt_seq = pt_seq; //parentboard key save in modal
                var tbody ='<tbody id="childelementtr" class="ui fluid"></tbody>';
                $('#popupscrollbody').append(tbody);
                if (rows.length > 0){
                    for (i=0; i<rows.length; i++){
                        var content = "<tr class='ui fluid'>"+"<td class='ui fluid two wide column' >";
                            content += rows[i][0];
                            content += "</td>"+"<td class='ui fluid'>"+rows[i][1]+"</td>";
                            content += "<td class='ui fluid'><input type='checkbox' class='invitecheck' name='invite' value="
                            content += rows[i][0]+ "></td></tr>";
                        $('#childelementtr').append(content);

                    }
                }else{
                    var content = "<tr class='ui fluid'>"+"<td class='ui fluid two wide column' style='color:#dc3545'>초대대상이 없습니다.</td>";
                    $('#childelementtr').append(content);
                }
                //list 이동
                //window.location.href ="{{ url_for('groupBoardlist')}}"
           },
           error: function(error) {
           }
        });

        $('.mini.modal')
          .modal('show')
        ;
    });

    $('#invitebtn').on('click',function(){
        var invitecheck = $(".invitecheck"); //get array checkbox
        var checkboxarr=[];
        for(i=0; i<invitecheck.length; i++){
            var checkresult = invitecheck[i].checked;
            if(checkresult){
                checkboxarr.push(invitecheck[i].value);
            }
        }

        if (checkboxarr.length > 0){
            $.ajax({
               url: '/inviteboardsave/',
               data: {'checkboxarr' : checkboxarr,'hidden_pt_seq':hidden_pt_seq},
               type: 'POST',
               success: function(response) {
                    alert('return success');
                    $('.mini.modal')
                      .modal('hide')
                    ;
               },
               error: function(error) {
               }
            });
        }
    });

    $(document).on('click','#grouptable td #updaterow',function(){
        var row = $(this).closest('tr');
		var td = row.children();
		var email = td.eq(0).text();
		var team =  td.eq(4).children().children().val()
        var useyn = td.eq(5).children().children().children('input[type=checkbox]').is(":checked") ;
        $.ajax({
           url: '/updateAjax/',
           data: {'email' : email,'team':team,'useyn':useyn},
           type: 'POST',
           success: function(response) {
               $("#successmessage").css("display", "block")
               .delay(1200).queue(function(){
                    $("#successmessage").css("display", "none").dequeue();
               });
           },
           error: function(error) {
           }
        });
    });

    $(document).on('click','#grouptable td #deleterow',function(){
        var row = $(this).closest('tr');
		var td = row.children();
		var email = td.eq(0).text();

        $.ajax({
           url: '/deleteAjax/',
           data: {'email' : email},
           type: 'POST',
           success: function(response) {
               row.remove();
               $('#messageheader').text('삭제')
               $("#successmessage").css("display", "block")
               .delay(1200).queue(function(){
                    $("#successmessage").css("display", "none").dequeue();
               });

           },
           error: function(error) {

           }
        });
    });

    $('#changephoto, #myimg, #myname').on('click', function(){
        $('input[type=file]').click();
        return false;
    });

    $('#findfile').change(function(event){
		var tmppath = URL.createObjectURL(event.target.files[0]);
		$('#changephoto, #myimg, #myname').attr('src',tmppath);
		$('#takechange').css('display','block');
	});

    function setImageFromFile(input, expression) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $(expression).attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
        $('#findfile').css('display','none');
        $('#takechange').css('display','block');
    }

    $('#takechange').on('click', function(){
        $('#takechange').css('display','none');
        var form_data = new FormData($('#upload-file')[0]);

        $.ajax({
            type: 'POST',
            url: '/takechangePhotoAjax',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: false,
            success: function (data) {
                $("#logoutmessage").css("display", "block")
               .delay(1200).queue(function(){
                    document.location.href="/logout";
               });
            },
            error: function (e) {
                alert("ERROR : "+ e);
            }
        });
    });

    $('#topmenu').on('click', function(){
        $('.ui.sidebar').sidebar('setting', 'transition', 'overlay').sidebar('toggle');
    });

    $('.codepen.icon').on('click',function(){
        $('#chatviewarea').css('display','block');
    });

    $('.append_article_btn').on('click',function(){
        $('.append_article_btn').css('display','none');
        $('.append_article_photo').css('display','block');
        $('.teamarticle_write').css('display','block');
        $('.append_article_save').css('display','block');

        $('.teamartical_write').focus();
    });

    $('.append_article_photo').on('click',function(){
        $('.append_article_btn').css('display','block');
        $('.append_article_photo').css('display','none');
        $('.teamarticle_write').css('display','none');
        $('.teamarticle_write').val('');
        $('.append_article_save').css('display','none');
    });

    $(document).on('click','.append_step_article_btn',function(){
        var row = $(this).closest('i');
        var replyon = row.attr('id');
        $('#'+replyon).css('display','none');

        var replyoff = row.next().attr('id');
        $('#'+replyoff).css('display','block');


        var textareaclass = row.next().next().next().attr('class');
        var splitclass = textareaclass.split(' ');
        var finalareaclass='';
        for (i=0; i<splitclass.length; i++){
            finalareaclass += '.'+splitclass[i];
        }

        $(finalareaclass).css('display','block');

        var pt_seq =row.next().next().next().next().val();
        var step =row.next().next().next().next().next().val();
        var email =row.next().next().next().next().next().next().val();
        var photo =row.next().next().next().next().next().next().next().val();

        var savebtnclass = row.next().next().next().next().next().next().next().next().attr('class');

        $('.'+savebtnclass).css('display','block');
        $('.'+savebtnclass).on('click',function(){
              var content = $(finalareaclass).val();
              if(content == "")  {
                   $('.mini.modal').modal('show');
                   return;
              }else{
                   $.ajax({
                        url: '/articleStepstepSaveAjax/',
                        data: {'pt_seq':pt_seq,'step':step,'email':email,'photo':photo,'content':content},
                        type: 'POST',
                        success: function(response) {
                           alert('success');
                           $('#'+replyon).css('display','block');
                           $('#'+replyoff).css('display','none');
                           $('.'+savebtnclass).css('display','none');
                           $('.'+textareaclass).attr('readonly','readonly');
                        },
                        error: function(error) {
                            alert(error);
                        }
                   });
              }

        });

        $('#'+replyoff).on('click',function(){
            $(finalareaclass).css('display','none');
            $(finalareaclass).val("");
            $('.'+savebtnclass).css('display','none');
            $('#'+replyoff).css('display','none');
            $('#'+replyon).css('display','block');
        });
    });
});
