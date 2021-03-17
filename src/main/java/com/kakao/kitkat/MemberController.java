package com.kakao.kitkat;
import java.io.BufferedOutputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import javax.servlet.http.HttpSession;

import org.apache.ibatis.session.SqlSession;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import com.kakao.kitkat.dao.MemberDao;
import com.kakao.kitkat.entities.Member;

@Controller
public class MemberController {
	@Autowired
	private SqlSession sqlSession;
	@Autowired
	Member member;

	@RequestMapping(value = "/login", method = { RequestMethod.POST, RequestMethod.GET })
	public String member_log(Model model, @ModelAttribute Member member) {
		return "login/login";
	}

	@RequestMapping(value = "/logout", method = RequestMethod.GET)
	public String logout(HttpSession session) {
		session.invalidate();
		return "redirect:index";

	}

	@RequestMapping(value = "/loginUp", method = RequestMethod.POST)
	public String loginUp(Locale locale, Model model, @ModelAttribute Member member, HttpSession session)
			throws Exception {
		MemberDao dao = sqlSession.getMapper(MemberDao.class);
		Member data = dao.selectOne(member.getEmail()); // 그냥 1234
		if (data == null) {
			return "login/login_fail";
		} else {
			boolean passchk = BCrypt.checkpw(member.getPassword(), data.getPassword()); // data.getPassword()
																						// =
																						// 암호화된
																						// 1234
			if (passchk) {
				session.setAttribute("sessionemail", data.getEmail());
				session.setAttribute("sessionname", data.getName());
				session.setAttribute("sessionmemlevel", data.getMemlevel());
				session.setAttribute("sessionphoto", data.getPhoto());
				return "redirect:index";

			} else {
				return "login/login_fail";

			}
		}

	}

	@RequestMapping(value = "/emailConfirmAjax", method = RequestMethod.POST)
	@ResponseBody
	public String emailConfirmAjax(@RequestParam String email) throws Exception {
		MemberDao dao = sqlSession.getMapper(MemberDao.class);
		Member data = dao.selectOne(email);
		String row = "y";
		if (data == null) {
			row = "n";
		} else {
			System.out.println("name:" + data.getName());
		}
		return row;
	}
	
	

	@RequestMapping(value = "/memberInsert", method = RequestMethod.GET) // 회원가입
	public String memberInsert(Locale locale, Model model) throws Exception {
		MemberDao dao = sqlSession.getMapper(MemberDao.class);
		return "member/member_insert";
	}

	@RequestMapping(value = "/memberUpdate", method = RequestMethod.GET)
	public String memberUpdate(Locale locale, Model model, HttpSession session) throws Exception {
		String email = (String) session.getAttribute("sessionemail");
		MemberDao dao = sqlSession.getMapper(MemberDao.class);
		System.out.println("업데이트했습니다");
		Member row = dao.selectOne(email);
		model.addAttribute("row", row);
		return "member/member_update";
	}

	@RequestMapping(value = "/memberUpdateSave", method = RequestMethod.POST)
	public String memberUpdateSave(Model model, @ModelAttribute Member member,
			@RequestParam CommonsMultipartFile imgfile) throws Exception {
		String filename = imgfile.getOriginalFilename();
		String path = "D:/UTIL/02170011/eyeconspringboot/src/main/resources/static/uploadimages";
		String realpath = "static/uploadimages/"; // server path
		if (filename.equals("")) {
			member.setPhoto(member.getOldphoto());
		} else {
			String cutemail = member.getEmail().substring(0, member.getEmail().indexOf("@"));
			byte bytes[] = imgfile.getBytes();
			try {
				BufferedOutputStream output = new BufferedOutputStream(
						new FileOutputStream(path + cutemail + filename));
				output.write(bytes);
				output.flush();
				output.close();
				System.out.println("path----->" + path);
				System.out.println("path----->" + cutemail);
				System.out.println("path----->" + filename);
				member.setPhoto(realpath + cutemail + filename); // 리얼패스가 아니라 패스로 들어가야 돼 프로젝트할 때
				if (!member.getPassword().equals(member.getOldpassword())) {
					String encodepassword = hashPassword(member.getPassword());
					member.setPassword(encodepassword);
				}
				MemberDao dao = sqlSession.getMapper(MemberDao.class);
//				int result = dao.memberUpdate(member);
//				System.out.println("-----result: "+ result);
				dao.updateRow(member);

			} catch (FileNotFoundException e) {
				e.printStackTrace();
			}
			System.out.println("---->cutemail: " + cutemail);

		}
		return "index";
	}

	@RequestMapping(value = "/member_insertSave", method = RequestMethod.POST)
	public String member_insertSave(Model model, @ModelAttribute Member member) throws Exception {
		if (member.getPhoto() == null) {
			member.setPhoto("resources/images/noimage.png");
		}
		MemberDao dao = sqlSession.getMapper(MemberDao.class);

		String encodepassword = hashPassword(member.getPassword());
		member.setPassword(encodepassword);
		String authNum = randomNum();
		String content = "회원가입을 환영합니다!" + "인증번호:" + authNum;
		sendEmail(member.getEmail(), content, authNum);
		dao.insertRow(member);

		return "index";
	}

	private String hashPassword(String plainTextPassword) {
		return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt());
	}

	@RequestMapping(value = "/memberList", method = RequestMethod.GET) // 회원목록보기
	public String memberList(Locale locale, Model model) throws Exception {
		MemberDao dao = sqlSession.getMapper(MemberDao.class);
		ArrayList<Member> members = dao.selectAll();

		model.addAttribute("members", members);
		return "member/member_list";
	}

	@RequestMapping(value = "/memberUpdateAjax", method = RequestMethod.POST) // 회원수정
	@ResponseBody
	public String memberUpdateAjax(@RequestParam String email, int level) throws Exception {
		MemberDao dao = sqlSession.getMapper(MemberDao.class);
		member.setEmail(email);
		member.setMemlevel(level);
		System.out.println("---->email: " + email);
		int result = dao.updateAjax(member);
		if (result > 0) {
			return "y";

		} else {
			return "n";

		}
	}

	@RequestMapping(value = "/memberDeleteAjax", method = RequestMethod.POST) // 회원삭제
	@ResponseBody
	public String memberDeleteAjax(@RequestParam String email) throws Exception {
		MemberDao dao = sqlSession.getMapper(MemberDao.class);
		int result = dao.deleteAjax(email);
		if (result > 0) {
			return "y";

		} else {
			return "n";
		}
	}

	private void sendEmail(String email, String content, String authNum) {
		String host = "smtp.gmail.com";
		String subject = "온라인토론 인증번호";
		String fromName = "토론 관리자";
		String from = "cocomelody45@gmail.com";
		String to1 = email;
		try {
			Properties props = new Properties();
			props.put("mail.smtp.starttls.enable", "true");
			props.put("mail.transport.protocol", "smtp");
			props.put("mail.smtp.host", host);
			props.setProperty("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
			props.put("mail.smtp.port", "587"); // or 465
			props.put("mail.smtp.user", from);
			props.put("mail.smtp.auth", "true");

			Session mailSession = Session.getInstance(props, new javax.mail.Authenticator() {
				protected PasswordAuthentication getPasswordAuthentication() {
					return new PasswordAuthentication("cocomelody45", "akubiowvmaieufxk"); // 위 gmail에서 생성된 비밀번호 넣는다
				}
			});
			Message msg = new MimeMessage(mailSession);
			msg.setFrom(new InternetAddress(from, MimeUtility.encodeText(fromName, "UTF-8", "B")));

			InternetAddress[] address1 = { new InternetAddress(to1) };
			msg.setRecipients(Message.RecipientType.TO, address1);
			msg.setSubject(subject);
			msg.setSentDate(new java.util.Date());
			msg.setContent(content, "text/html;charset=euc-kr");
			Transport.send(msg);
		} catch (Exception e) {
		}
	}

	String randomNum() {
		StringBuffer buffer = new StringBuffer();
		for (int i = 0; i <= 3; i++) {
			int n = (int) (Math.random() * 10);
			buffer.append(n);
		}
		return buffer.toString();
	}

}
