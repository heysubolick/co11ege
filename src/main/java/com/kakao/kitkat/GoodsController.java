package com.kakao.kitkat;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import javax.servlet.http.HttpSession;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.kakao.kitkat.dao.BoardDao;
import com.kakao.kitkat.dao.GoodsDao;
import com.kakao.kitkat.entities.Goods;
import com.kakao.kitkat.entities.GoodsPaging;

@Controller
public class GoodsController {
	
	@Autowired
	private SqlSession sqlSession;
	@Autowired
	Goods goods;
	@Autowired
	GoodsPaging goodspaging;
	public static String find;
	
	
	@RequestMapping(value = "/delivery", method = RequestMethod.GET)
	public String delivery(Locale locale, Model model) {
		return "goods/delivery";
	}

	@RequestMapping(value = "/goodsPageList", method = RequestMethod.GET)
	public String goodsPageList(Locale locale, Model model) throws Exception {
		GoodsDao dao = sqlSession.getMapper(GoodsDao.class);
		int pagesize = 10;
		int page = 1;
		int startrow = (page - 1) * pagesize;
		int endrow = 10;

		goodspaging.setFind(this.find);
		if (goodspaging.getFind() == null) {
			goodspaging.setFind("");
		}

		goodspaging.setStartrow(startrow);
		goodspaging.setEndrow(endrow);
		int rowcount = dao.goodsSelectCountFirst(goodspaging);
		int absPage = 1;

		if (rowcount % pagesize == 0) {
			absPage = 0;
		}
		int pagecount = rowcount / pagesize + absPage;
		int pages[] = new int[pagecount];
		for (int i = 0; i < pagecount; i++) {
			pages[i] = i + 1;
		}

		ArrayList<Goods> goodses = dao.goodsSelectPageList(goodspaging);

		model.addAttribute("goodses", goodses);
		model.addAttribute("pages", pages);
		return "goods/goods_page_list";
	}
	
//	@RequestMapping(value = "/goodsDetail", method = RequestMethod.GET)
//	public String goodsDetail(Model model, @RequestParam int g_seq, HttpSession session) throws Exception {
//		GoodsDao dao = sqlSession.getMapper(GoodsDao.class);
//		goods = dao.goodsSelectOne(g_seq);
////		String cursession = (String) session.getAttribute("sessionemail");
////		if (cursession.equals(board.getB_studentno())) {
////			dao.addHit(b_seq);
////		}
//		model.addAttribute("goods", goods);
//		return "goods/goods_detail";
//	}
	
	
	
	@RequestMapping(value = "/goodsDetail2", method = RequestMethod.GET)
	public String goodsDetail2(Model model, @RequestParam int g_seq, HttpSession session) throws Exception {
		GoodsDao dao = sqlSession.getMapper(GoodsDao.class);
		goods = dao.goodsSelectOne(g_seq);
//		System.out.println(g_seq);
		model.addAttribute("goods", goods);
		return "goods/goods_detail2";
	}
	
	@RequestMapping(value = "/goodsWrite", method = RequestMethod.GET)
	public String goodsWrite(Locale locale, Model model) {
		return "goods/goods_write";
	}
	
	@RequestMapping(value = "/goodsWriteSave", method = RequestMethod.POST)
	public String goodsWriteSave(Model model, @ModelAttribute Goods goods,
			@RequestParam("g_attachfile") MultipartFile g_attachfile, MultipartHttpServletRequest request) throws Exception {
		List<MultipartFile> fileList = request.getFiles("g_attachfile");
        String path = "D:/util/college/src/main/resources/static/uploadattachs/";
		String filename = g_attachfile.getOriginalFilename();
		String realpath = "uploadattachs/"; // server path
		 for (MultipartFile mf : fileList) {
	            String originFileName = mf.getOriginalFilename(); // 원본 파일 명
	            long fileSize = mf.getSize(); // 파일 사이즈
	            String safeFile = path + originFileName;
	            try {
	                mf.transferTo(new File(safeFile));
	                goods.setG_attach(realpath + filename);
	            } catch (IllegalStateException e) {
	                // TODO Auto-generated catch block
	                e.printStackTrace();
	            } catch (IOException e) {
	                // TODO Auto-generated catch block
	                e.printStackTrace();
	            }
	        }
		SimpleDateFormat df = new SimpleDateFormat("yyyy년 MM월 dd일 hh시 mm:ss");
		Date date = new Date();
		String today = df.format(date);
		GoodsDao dao = sqlSession.getMapper(GoodsDao.class);
		dao.goodsInsertRow(goods);

		return "index";
	}
	
	
}
