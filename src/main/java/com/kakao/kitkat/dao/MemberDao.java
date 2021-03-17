package com.kakao.kitkat.dao;

import java.util.ArrayList;

import com.kakao.kitkat.entities.Member;

public interface MemberDao {
	public Member selectOne(String email) throws Exception;

	public int insertRow(Member member) throws Exception;

	public int updateRow(Member member) throws Exception;

	public ArrayList<Member> selectAll() throws Exception;

	public int updateAjax(Member member) throws Exception;

	public int deleteAjax(String email) throws Exception;
}