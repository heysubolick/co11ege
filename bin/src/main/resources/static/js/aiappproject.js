function confirm_email(){
	var yncheck = $('.confirmyn').val();
	if(yncheck=="n"){
		msg = "email 중복검사를 하세요!"
			$('.description').text(msg);
			$('.modal').modal('show');
	}
}

$(document).ready(function(){
	
	$('.confirm').on('click', function(){
		var email = $('#email').val();
		if(email == ""){
			$('.description').text("E-mail을 입력하세요!");
			$('.modal').modal('show');
			return;
		}else{
			var email = email;
			$.ajax({
	            type:'POST',
	            data : {email:email},
	            datatype:'json',
	            url : 'emailConfirmAjax',
	            contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
	            success : function(data){
	            	var msg="";
	            	if(data == "y"){
	            		msg = "사용중인 email입니다!"
            			$('.confirmyn').val('n');
            			$('.description').text(msg);
		    			$('.modal').modal('show');
		    			$('#email').val('');
		    			$('#email').focus();
	            	}else{
	            		$('.confirmyn').val('y');
	            		msg = "사용 가능한 email입니다!"
            			$('.description').text(msg);
		    			$('.modal').modal('show');
	            	}
	            	
	            },
	            error : function(xhr, status, error){
	                alert('ajax error'+xhr.status);
	            }
        	});
		  }
		  $('.ui.black.deny.button').modal('hide');
	});
	
	$('#viewphoto').on('click',function(){
		$('input[type=file]').click();
		return false;
	});
	
	$('#imgfile').on('change',function(event){
		var imgpath = URL.createObjectURL(event.target.files[0]);
		$('#viewphoto').attr('src',imgpath);
	});
	
	$('#memberexample').DataTable( {
        deferRender:    true,
        autoWidth: 		false,
        scrollY:        500,
        scrollCollapse: true,
        scroller:       true,
        language: { search: "" }
    } );
	
	$(document).on('click','#memberexample td #editbtn',function(){
		var row = $(this).closest('tr');
		var td = row.children();
		var email = td.eq(1).text();
		var level = td.eq(4).children().val();
		
		$.ajax({
            type:'POST',
            data : {email:email,level:level},
            datatype:'json',
            url : 'memberUpdateAjax',
            contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
            success : function(data){
            	if(data=="y"){
            		$('#resultmessage').text("수정 되었습니다.");
            	}else{
            		$('#resultmessage').text("수정 되지 않았습니다.");
            	}
            	
            	$('#successmessage').css('display',"block")
            	.delay(1200).queue(function(){
            		$('#successmessage').css('display',"none").dequeue();
            	});
            },
            error : function(xhr, status, error){
                alert('ajax error'+xhr.status);
            }
    	});
	});
	$(document).on('click','#memberexample td #deletebtn',function(){
		var row = $(this).closest('tr');
		var td = row.children();
		var email = td.eq(1).text();
		
		$('.ui.mini.modal.delete').modal('show');
		
		$('#deleteok').on('click',function(){
			$.ajax({
	            type:'POST',
	            data : {email:email},
	            datatype:'json',
	            url : 'memberDeleteAjax',
	            contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
	            success : function(data){
	            	if(data=="y"){
	            		row.remove();
	            		$('#resultmessage').text("삭제 되었습니다.");
	            	}else{
	            		$('#resultmessage').text("삭제 되지 않았습니다.");
	            	}
	            	
	            	$('#successmessage').css('display',"block")
	            	.delay(1200).queue(function(){
	            		$('#successmessage').css('display',"none").dequeue();
	            	});
	            	$('.ui.mini.modal.delete').modal('hide');
	            },
	            error : function(xhr, status, error){
	                alert('ajax error'+xhr.status);
	            }
	    	});
		});
		
		$('#deletecancel').on('click',function(){
			$('.ui.mini.modal.delete').modal('hide');
		});
		
			
	});
});
