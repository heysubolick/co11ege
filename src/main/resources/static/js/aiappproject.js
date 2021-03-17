
function confirm_email() {
	var yncheck = $('.confirmyn').val();
	if (yncheck == "n") {
		msg = "email 중복검사를 하세요!"
		$('.modal').modal('show');
	}
}

function indexReload() {
	window.location.reload();
}

window.onload = function() {
	$('.ui.dropdown').dropdown();
};


tinymce.init({
	selector: 'textarea',
	plugins: 'advlist autolink lists link image charmap print preview hr anchor pagebreak',
	toolbar_mode: 'floating',
	tinycomments_mode: "floating",
	tinycomments_author: "Author name",
	width: '100%',
	branding: false
});

function comonFinal(thistext){
		message = "";
		message = "<span style='color:#ff0000'>"+$(this).text()+"</span>";
		message += "<span style='color:#000000'>입니다.+</span>";
		message += "<span style='color:#000000'>[확인]</span><br><br>";
		message += "<span style='color:#ff0000'> 클릭시 복구가</span>"
		message += "<span style='color:#000000'> 되지 않습니다.</span>";
	return message;
}

function zipcodeFind() {
	new daum.Postcode({
		oncomplete: function(data) {
			// 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.
			// 각 주소의 노출 규칙에 따라 주소를 조합한다.
			// 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
			var fullAddr = ''; // 최종 주소 변수
			var extraAddr = ''; // 조합형 주소 변수
			// 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
			if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
				fullAddr = data.roadAddress;
			} else { // 사용자가 지번 주소를 선택했을 경우(J)
				fullAddr = data.jibunAddress;
			}
			// 사용자가 선택한 주소가 도로명 타입일때 조합한다.
			if (data.userSelectedType === 'R') {
				//법정동명이 있을 경우 추가한다.
				if (data.bname !== '') {
					extraAddr += data.bname;
				}
				// 건물명이 있을 경우 추가한다.
				if (data.buildingName !== '') {
					extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
				}
				// 조합형주소의 유무에 따라 양쪽에 괄호를 추가하여 최종 주소를 만든다.
				fullAddr += (extraAddr !== '' ? ' (' + extraAddr + ')' : '');
			}
			// 우편번호와 주소 정보를 해당 필드에 넣는다.
			document.getElementById('zipcode').value = data.zonecode; //5자리 새우편번호 사용
			document.getElementById('addr1').value = fullAddr;
			// 커서를 상세주소 필드로 이동한다.
			document.getElementById('addr2').focus();
		}
	}).open();
}


$(document).ready(function() {
	$('.ui.dropdown').dropdown();

	$('.vendercodeconfirm').on('click', function() {
		var code = $('#code').val();
		if (code == "") {
			$('.description').text("사업자번호을 입력하세요!");
			$('.modal').modal('show');
			return;
		} else {
			var code = code;
			$.ajax({
				type: 'POST',
				data: { code: code },
				datatype: 'json',
				url: 'venderCodeConfirmAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					var msg = "";
					if (data == "y") {
						msg = "사용중인 사업자번호입니다!"
						$('.confirmyn').val('n');
						$('.description').text(msg);
						$('.modal').modal('show');
						$('#code').val('');
						$('#code').focus();
					} else {
						$('.confirmyn').val('y');
						msg = "사용 가능한 사업자번호입니다!"
						$('.description').text(msg);
						$('.modal').modal('show');
					}

				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		}
		$('.ui.black.deny.button').modal('hide');
	});
	
	$("#selectproduct").on("change", function() {
		var code = $("#selectproduct").val();
		$.ajax({
			type: 'POST',
			data: { code: code },
			datatype: 'json',
			url: 'productSelectAjax',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				$('#price').val(data.buyprice);
				$('#qty').focus;
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
	})
	$("#selectvender").on("change", function() {
		var vendcode = $("#selectvender").val();
		$.ajax({
			type: 'POST',
			data: { vendcode: vendcode },
			datatype: 'json',
			url: 'buyNew',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				$('#rightVenderName').val(data.vendname);
				$('#vendnameInsert').val(data.vendname);
				$('#yyyy').val(data.yyyy);
				$('#mm').val(data.mm);
				$('#dd').val(data.dd);
				$('#no').val(data.no);
				$('#hang').val(data.hang);
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
	})

	$("#buyinsertbutton").on("click", function() {
		var vendcode = $("#selectvender").val();
		
		if (vendcode == "0") {
			$(".description").text("거래처를 선택하세요");
			$('.ui.modal.buy').modal('show');
			$("#buybutton").on('click', function() {
				$('.ui.mini.modal.buy').modal('hide');
				return;
			});
			return;
			}
		var code = $("#selectproduct").val();	
		if(code == "0"){
			$(".description").text("상품을 선택하세요");
			$('.ui.modal.buy').modal('show');
			
			$("#buybutton").on('click', function() {
				$('.ui.mini.modal.buy').modal('hide');
				return;
			});
			return;
		}
		$("#buyinsert").submit();
	});

	$('#qty').keyup(function() {
		var price = $('#price').val();
		var qty = $(this).val();
		$('#total').val(price*qty);
	})
	
	$('#findbtnclick').on('click',function(){
		var vendcode = $("#selectvenderfind").val();
		if (vendcode == "0") {
			$(".description").text("거래처를 선택하세요");
			$('.ui.modal.buy').modal('show');
			$("#buybutton").on('click', function() {
				$('.ui.mini.modal.buy').modal('hide');
				return;
			});
			return;
			}
		$("#buyfind").submit();
	})
	$("#selectvenderfind").on('change',function(){
		var vendname = $("#selectvenderfind option:selected").text();
		$('#hiddenvendname').val(vendname);
	})
	
	$('#buyinsert').attr('action','buyinsert');
	/*$("#buyinsert").submit();*/
	
	var publicselectedrow;
	
	$("#buyfindtable").on('click', '#buyitemrow','td', function(){
		var row = $(this).closest('tr');
		publicselectedrow = row;
		var td = row.children();
		var seq = td.eq(0).text();
		/*td.eq(3).attr('text',"3");
		td.eq(4).attr('text',"4");
		td.eq(5).attr('text',"5");
		td.eq(6).attr('text',"6");*/
		$.ajax({
			type: 'POST',
			data: { seq:seq },
			datatype: 'json',
			url: 'buyRowItemSelectedAjax',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				$('#seq').val(data.seq);
				$('#selectvender').val(data.vendcode).attr("selected","selected");
				$('#selectproduct').val(data.procode).attr("selected","selected");
				$('#yyyy').val(data.yyyy);
				$('#vendname').val(data.vendname);
				$('#proname').val(data.proname);
				$('#mm').val(data.mm);
				$('#dd').val(data.dd);
				$('#no').val(data.no);
				$('#hang').val(data.hang);
				$('#price').val(data.price);
				$('#total').val(data.total);
				$('#qty').val(data.qty);
				$('#beforeqty').val(data.qty);
				$('#beforeprice').val(data.price);
				$('#memo').val(data.memo);
				$('#beforeprocode').val(data.procode);
				$('#buysaveupdateGroupsave').css('display','none');
				$('#buysaveupdateGroupupdate').css('display','block');
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
	})
	
	
	
	$('#buyupdatebtn').on('click',function(){
		var vendcode=$('#selectvender').val();
		var vendname=$('#vendname').val();
		var seq=$('#seq').val();
		var procode=$('#selectproduct').val();
		var proname=$('#proname').val();
		var beforeprocode=$('#beforeprocode').val();
		var yyyy=$('#yyyy').val();
		var mm=$('#mm').val();
		var dd=$('#dd').val();
		var no=$('#no').val();
		var hang=$('#hang').val();
		var beforeprice = $('#beforeprice').val();
		var price=$('#price').val();
		var qty=$('#qty').val();
		var beforeqty = $('#beforeqty').val();
		var total=$('#total').val();
		var beforetotal=$('#beforetotal').val();
		var memo=$('#memo').val();
		var obj = {"proname":proname,"seletedRow":seletedRow,"seq":seq, "yyyy":yyyy, "mm":mm ,"dd":dd, "no":no, "hang":hang, "beforeprice":beforeprice, 
		"procode":procode,"beforeprocode":beforeprocode,"vendcode":vendcode,"vendname":vendname,
		"price":price, "qty":qty, "beforeqty":beforeqty, "total":total, "beforetotal":beforetotal, "memo":memo};
		$.ajax({
			type: 'POST',
			data: JSON.stringify(obj),
			datatype: 'json',
			url: 'buyUpdatejsonAjax',
			contentType: 'application/json',
			success: function(data) {
				var td = publicselectedrow.children();
				var result = td.eq(3).text(data.proname);
				td.eq(4).text(data.price);
				td.eq(5).text(data.qty);
				$('#resultmessage').text("수정 되었습니다.");
				$('#successmessage').css('display', "block")
					.delay(1200).queue(function() {
						$('#successmessage').css('display', "none").dequeue();
					});
				
				/*var pricetd = $('#buyfindtable').find("td[text='4']");
				var qtytd= $('#buyfindtable').find("td[text='5']");
				var totaltd= $('#buyfindtable').find("td[text='6']");
				pricetd.text(price);
				qtytd.text(qty);
				totaltd.text(total);*/
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
	});
	
	$('#buydeletebtn').on('click',function(){
		$('.ui.mini.modal.buydelete').modal('show');
		3
		$('#buydeleteOkbtn').on('click',function(){
			var seq = publicselectedrow.children().eq(0).text();
			$.ajax({
			type: 'POST',
			data: { seq:seq },
			datatype: 'json',
			url: 'buyRowItemDeleteAjax',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				$('.ui.mini.modal.buydelete').modal('hide');				
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
		})
		
		$('#buydeletecanclebtn').on('click',function(){
			$('.ui.mini.modal.buydelete').modal('hide');
		})
		
	});
	
		$('#yyyyFinal').on('click',function(){
				message = "";
				message = "<span style='color:#ff0000'>"+$(this).text()+"</span>";
				message += "<span style='color:#000000'>입니다.+</span>";
				message += "<span style='color:#000000'>[확인]</span><br><br>";
				message += "<span style='color:#ff0000'> 클릭시 복구가</span>"
				message += "<span style='color:#000000'> 되지 않습니다.</span>";
			$('.desctiption').append(message);
			$('.ui.mini.modal.final').modal('show');
			$('#finalform').attr('action','yyyyFinal');
			$('#finalform').submit();
			
		$('#buydeleteOkbtn').on('click',function(){
			var seq = publicselectedrow.children().eq(0).text();
			$.ajax({
			type: 'POST',
			data: { seq:seq },
			datatype: 'json',
			url: 'buyRowItemDeleteAjax',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				$('.ui.mini.modal.buydelete').modal('hide');				
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
		})
		
		$('#buydeletecanclebtn').on('click',function(){
			$('.ui.mini.modal.buydelete').modal('hide');
		})
		
	});
	
	
 $(document)
    .ready(function() {

      // fix menu when passed
      $('.masthead')
        .visibility({
          once: false,
          onBottomPassed: function() {
            $('.fixed.menu').transition('fade in');
          },
          onBottomPassedReverse: function() {
            $('.fixed.menu').transition('fade out');
          }
        })
      ;

      // create sidebar and attach to menu open
      $('.ui.sidebar')
        .sidebar('attach events', '.toc.item')
      ;

    })
  ;
	
	
	//balance 리스트에서 변경
	$(document).on('click', '#balanceexample td #balanceeditbtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var yyyy = td.eq(3).text();
		var changebalance = td.eq(7).children().val();
		var vendcode = td.eq(4).text();
		$.ajax({
			type: 'POST',
			data: { yyyy: yyyy, changebalance: changebalance, vendcode: vendcode },
			datatype: 'json',
			url: 'balanceUpdateAjax',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				if (data == "y") {
					$('#resultmessage').text("수정 되었습니다.");
				} else {
					$('#resultmessage').text("수정 되지 않았습니다.");
				}

				$('#successmessage').css('display', "block")
					.delay(1200).queue(function() {
						$('#successmessage').css('display', "none").dequeue();
					});
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
	});

	//balance 리스트에서 삭제
	$(document).on('click', '#balanceexample td #balancedeletebtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var yyyy = td.eq(3).text();
		var vendcode = td.eq(4).text();

		$('.ui.mini.modal.balancedel').modal('show');

		$('#balancedeleteok').on('click', function() {
			$.ajax({
				type: 'POST',
				data: { yyyy: yyyy, vendcode: vendcode },
				datatype: 'json',
				url: 'balanceDeleteAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					if (data == "y") {
						row.remove();
						$('#resultmessage').text("삭제 되었습니다.");
					} else {
						$('#resultmessage').text("삭제 되지 않았습니다.");
					}
					$('#successmessage').css('display', "block")
						.delay(1200).queue(function() {
							$('#successmessage').css('display', "none").dequeue();
						});
					$('.ui.mini.modal.balancedel').modal('hide');
				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		});
	});
	//vender code 중복확인
	$('.vendercodeconfirm').on('click', function() {
		var code = $('#code').val();
		if (code == "") {
			$('.description').text("사업자번호을 입력하세요!");
			$('.modal').modal('show');
			return;
		} else {
			var code = code;
			$.ajax({
				type: 'POST',
				data: { code: code },
				datatype: 'json',
				url: 'venderCodeConfirmAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					var msg = "";
					if (data == "y") {
						msg = "사용중인 사업자번호입니다!"
						$('.confirmyn').val('n');
						$('.description').text(msg);
						$('.modal').modal('show');
						$('#code').val('');
						$('#code').focus();
					} else {
						$('.confirmyn').val('y');
						msg = "사용 가능한 사업자번호입니다!"
						$('.description').text(msg);
						$('.modal').modal('show');
					}

				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		}
		$('.ui.black.deny.button').modal('hide');
	});
	//vender 리스트에서 삭제
	$(document).on('click', '#venderexample td #venderdeletebtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var code = td.eq(2).text();

		$('.ui.mini.modal.venderdel').modal('show');

		$('#venderdeleteok').on('click', function() {
			$.ajax({
				type: 'POST',
				data: { code: code },
				datatype: 'json',
				url: 'venderDeleteAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					if (data == "y") {
						row.remove();
						$('#resultmessage').text("삭제 되었습니다.");
					} else {
						$('#resultmessage').text("삭제 되지 않았습니다.");
					}
					$('#successmessage').css('display', "block")
						.delay(1200).queue(function() {
							$('#successmessage').css('display', "none").dequeue();
						});
					$('.ui.mini.modal.venderdel').modal('hide');
				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		});

		$('#venderdeletecancel').on('click', function() {
			$('.ui.mini.modal.venderdel').modal('hide');
		});

	});

	//productcode 중복확인
	$('.confirmcode').on('click', function() {
		var code = $('#code').val();
		if (code == "") {
			$('.description').text("code을 입력하세요!");
			$('.modal').modal('show');
			return;
		} else {
			var code = code;
			$.ajax({
				type: 'POST',
				data: { code: code },
				datatype: 'json',
				url: 'codeConfirmAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					var msg = "";
					if (data == "y") {
						msg = "사용중인 code입니다!"
						$('.confirmyn').val('n');
						$('.description').text(msg);
						$('.modal').modal('show');
						$('#code').val('');
						$('#code').focus();
					} else {
						$('.confirmyn').val('y');
						msg = "사용 가능한 code입니다!"
						$('.description').text(msg);
						$('.modal').modal('show');
					}

				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		}
		$('.ui.black.deny.button').modal('hide');
	});
	//product리스트에서 삭제
	$(document).on('click', '#productexample td #productdeletebtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var code = td.eq(2).text();

		$('.ui.mini.modal.productdel').modal('show');

		$('#productdeleteok').on('click', function() {
			$.ajax({
				type: 'POST',
				data: { code: code },
				datatype: 'json',
				url: 'productDeleteAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					if (data == "y") {
						row.remove();
						$('#resultmessage').text("삭제 되었습니다.");
					} else {
						$('#resultmessage').text("삭제 되지 않았습니다.");
					}
					$('#successmessage').css('display', "block")
						.delay(1200).queue(function() {
							$('#successmessage').css('display', "none").dequeue();
						});
					$('.ui.mini.modal.productdel').modal('hide');
				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		});

		$('#deletecancel').on('click', function() {
			$('.ui.mini.modal.productdel').modal('hide');
		});

	});

	//product 리스트에서 변경
	$(document).on('click', '#productexample td #producteditbtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var code = td.eq(2).text();
		var stock = td.eq(18).children().val();
		alert(stock)

		$.ajax({
			type: 'POST',
			data: { code: code, stock: stock },
			datatype: 'json',
			url: 'productUpdateAjax',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				if (data == "y") {
					$('#resultmessage').text("수정 되었습니다.");
				} else {
					$('#resultmessage').text("수정 되지 않았습니다.");
				}

				$('#successmessage').css('display', "block")
					.delay(1200).queue(function() {
						$('#successmessage').css('display', "none").dequeue();
					});
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
	});

	//balanceList에서 detail로
	$("#listToDetail").on('click', function() {
		$("form").submit();
	})

	//급여계산
	$("#taxbtn").on('click', function() {
		$('.description').text("계산?기존정보 사라짐");
		$('.ui.mini.modal.cal').modal('show');
	});

	//급여계산 모달 ok
	$('#calok').on('click', function() {
		$("#taxform").attr("action", "salaryTaxRun");
		$("form").submit();
	});
	//급여계산 모달 cancel
	$('#calcancel').on('click', function() {
		$('.ui.mini.modal.delete').modal('hide');
	});


	$("#deletetaxbtn").on('click', function() {
		$('.ui.mini.modal.del').modal('show');
	});
	$('#salaryrolldeleteok').on('click', function() {
		$("#taxform").attr("action", "salaryTaxDelete");
		$("form").submit();
	});

	$('#delcancle').on('click', function() {
		$('.ui.mini.modal.delete').modal('hide');
	});

	$(document).on('click', '#memberexample td #memberdeletebtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var email = td.eq(1).text();

		$('.ui.mini.modal.delete').modal('show');

		$('#deleteok').on('click', function() {
			$.ajax({
				type: 'POST',
				data: { email: email },
				datatype: 'json',
				url: 'memberDeleteAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					if (data == "y") {
						row.remove();
						$('#resultmessage').text("삭제 되었습니다.");
					} else {
						$('#resultmessage').text("삭제 되지 않았습니다.");
					}
					$('#successmessage').css('display', "block")
						.delay(1200).queue(function() {
							$('#successmessage').css('display', "none").dequeue();
						});
					$('.ui.mini.modal.delete').modal('hide');
				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		});
	});

		$('#deletecancel').on('click', function() {
			$('.ui.mini.modal.delete').modal('hide');
		});

	




	$('.ui.dropdown').dropdown({
		onChange: function(lang) {
			$.ajax({
				type: 'POST',
				data: { lang: lang },
				datatype: 'json',
				url: 'languageAjax',
				async: false,
				success: function(data) {
					console.log(data);
					setTimeout(function() {
						window.location.reload();
					}, 100);
				},
				error: function(xhr, status, error) {
				}
			});
		},
		forceSelection: false,
		selectOnKeydown: false,
		showOnFocus: false,
		on: "hover"
	});

	$('.confirmempno').on('click', function() {
		var empno = $('#empno').val();
		if (empno == "") {
			$('.description').text("empno을 입력하세요!");
			$('.modal').modal('show');
			return;
		} else {
			var empno = empno;
			$.ajax({
				type: 'POST',
				data: { empno: empno },
				datatype: 'json',
				url: 'empnoConfirmAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					var msg = "";
					if (data == "y") {
						msg = "사용중인 empno입니다!"
						$('.confirmyn').val('n');
						$('.description').text(msg);
						$('.modal').modal('show');
						$('#empno').val('');
						$('#empno').focus();
					} else {
						$('.confirmyn').val('y');
						msg = "사용 가능한 empno입니다!"
						$('.description').text(msg);
						$('.modal').modal('show');
					}

				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		}
		$('.ui.black.deny.button').modal('hide');
	});

	$('.confirm').on('click', function() {
		var email = $('#email').val();
		if (email == "") {
			$('.description').text("E-mail을 입력하세요!");
			$('.modal').modal('show');
			return;
		} else {
			var email = email;
			$.ajax({
				type: 'POST',
				data: { email: email },
				datatype: 'json',
				url: 'emailConfirmAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					var msg = "";
					if (data == "y") {
						msg = "사용중인 email입니다!"
						$('.confirmyn').val('n');
						$('.description').text(msg);
						$('.modal').modal('show');
						$('#email').val('');
						$('#email').focus();
					} else {
						$('.confirmyn').val('y');
						msg = "사용 가능한 email입니다!"
						$('.description').text(msg);
						$('.modal').modal('show');
					}

				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		}
		$('.ui.black.deny.button').modal('hide');
	});

	$('#viewphoto').on('click', function() {
		$('input[type=file]').click();
		return false;
	});

	$('#imgfile').on('change', function(event) {
		var imgpath = URL.createObjectURL(event.target.files[0]);
		$('#viewphoto').attr('src', imgpath);
	});

	$('#memberexample').DataTable({
		deferRender: true,
		autoWidth: false,
		scrollY: 500,
		scrollCollapse: true,
		scroller: true,
		language: { search: "" }
	});
	$('#balanceexample').DataTable({
		deferRender: true,
		autoWidth: false,
		scrollY: 500,
		scrollCollapse: true,
		scroller: true,
		language: { search: "" }
	});
	$('#productexample').DataTable({
		deferRender: true,
		autoWidth: false,
		scrollY: 500,
		scrollCollapse: true,
		scroller: true,
		language: { search: "" }
	});
	$('#venderexample').DataTable({
		deferRender: true,
		autoWidth: false,
		scrollY: 500,
		scrollCollapse: true,
		scroller: true,
		language: { search: "" }
	});
	$('#buyexample').DataTable({
		deferRender: true,
		autoWidth: false,
		scrollY: 500,
		scrollCollapse: true,
		scroller: true,
		language: { search: "" }
	}); buyexample
	//salarylist
	$('#salaryexample').DataTable({
		aaSorting: [],
		deferRender: true,
		autoWidth: false,
		scrollY: 500,
		scrollCollapse: true,
		scroller: true,
		language: { search: "" }
	});
	$(document).on('click', '#salaryexample td #salayeditbtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var empno = td.eq(0).text();
		var yn = td.eq(10).children().val();
		$.ajax({
			type: 'POST',
			data: { empno: empno, yn: yn },
			datatype: 'json',
			url: 'salaryUpdateAjax',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				if (data == "y") {
					$('#resultmessage').text("수정 되었습니다.");
				} else {
					$('#resultmessage').text("수정 되지 않았습니다.");
				}

				$('#successmessage').css('display', "block")
					.delay(1200).queue(function() {
						$('#successmessage').css('display', "none").dequeue();
					});
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
	});

	$(document).on('click', '#salaryexample td #salarydeletebtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var empno = td.eq(0).children().children().text();

		$('.ui.mini.modal.delete').modal('show');

		$('#salarydeleteok').on('click', function() {
			$.ajax({
				type: 'POST',
				data: { empno: empno },
				datatype: 'json',
				url: 'salaryDeleteAjax',
				contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
				success: function(data) {
					if (data == "y") {
						row.remove();
						$('#resultmessage').text("삭제 되었습니다.");
					} else {
						$('#resultmessage').text("삭제 되지 않았습니다.");
					}

					$('#successmessage').css('display', "block")
						.delay(1200).queue(function() {
							$('#successmessage').css('display', "none").dequeue();
						});
					$('.ui.mini.modal.delete').modal('hide');
				},
				error: function(xhr, status, error) {
					alert('ajax error' + xhr.status);
				}
			});
		});

		$('#salarydeletecancel').on('click', function() {
			$('.ui.mini.modal.delete').modal('hide');
		});
	});
	//salarylist end

	$('.attachbtn').on('click', function() {
		$('#b_attach').click();
		$('#b_attach').change(function() {
			var filename = $('#b_attach').val();
			$('.b_attachname').attr('value', filename);
		});
	});

	$('.boarddelete').on('click', function() {
		$('.ui.mini.modal.boardmodal').modal('show');

		$('#modalcancle').on('click', function() {
			$('.ui.mini.modal.boardmodal').modal('hide');
			return;
		});

		$('#modaldelete').on('click', function() {
			$('.ui.mini.modal.boardmodal').modal('hide');
			var b_seq = $('#hidden_seq').val();
			alert("success" + b_seq)
			document.location.href = "boardDelete?b_seq=" + b_seq;

		});

	});
	//member
	$(document).on('click', '#memberexample td #editbtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var email = td.eq(1).text();
		var level = td.eq(4).children().val();

		$.ajax({
			type: 'POST',
			data: { email: email, level: level },
			datatype: 'json',
			url: 'memberUpdateAjax',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				if (data == "y") {
					$('#resultmessage').text("수정 되었습니다.");
				} else {
					$('#resultmessage').text("수정 되지 않았습니다.");
				}

				$('#successmessage').css('display', "block")
					.delay(1200).queue(function() {
						$('#successmessage').css('display', "none").dequeue();
					});
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
	});
	
	$(document).on('click', '#dueManage td #yyyybtn', function() {
		var row = $(this).closest('tr');
		var td = row.children();
		var empno = td.eq(0).text();
		var yn = td.eq(10).children().val();
		$.ajax({
			type: 'POST',
			data: { empno: empno, yn: yn },
			datatype: 'json',
			url: 'duemanagemodal',
			contentType: 'application/x-www-form-urlencoded; charset=euc-kr',
			success: function(data) {
				if (data == "y") {
					$('#resultmessage').text("수정 되었습니다.");
				} else {
					$('#resultmessage').text("수정 되지 않았습니다.");
				}

				$('#successmessage').css('display', "block")
					.delay(1200).queue(function() {
						$('#successmessage').css('display', "none").dequeue();
					});
			},
			error: function(xhr, status, error) {
				alert('ajax error' + xhr.status);
			}
		});
	});


});




