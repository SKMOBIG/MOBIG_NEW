#  데이터 읽어들이기
prod_ranking_mvno_top10 = read.csv("prod_ranking_mvno_top10.csv", header = T, sep = ",")
str(prod_ranking_mvno_top10)

# 사업자별로 데이터 쪼개기-list 구조로
tmp <- split(prod_ranking_mvno_top10, prod_ranking_mvno_top10$corp_nm)

# 데이터프레임 구조로 저장
emrt <- tmp[11]
emrt <- data.frame(emrt)
# emrt <- emrt[-1,]
# str(emrt)
names(emrt)
names(emrt)[1] <- 'mvno_co_cd'
names(emrt)[2] <- 'gb_cd'
names(emrt)[3] <- 'corp_nm'
names(emrt)[4] <- 'prod_id'
names(emrt)[5] <- 'prod_nm'
names(emrt)[6] <- 'ranking'
names(emrt)[7] <- 'cnt'

emrt <- subset(emrt, gb_cd == "후불")

# 선/후불 통합 랭킹
#emrt <- emrt[order(-emrt$cnt),]

#백분율 추가
emrt <- transform(emrt, cnt2 = cnt/sum(cnt)*100)

# 시각화
ggplot(emrt, aes(x=ranking, y=cnt2, fill=prod_nm)) + 
  geom_bar(stat="identity", width = 0.2) + 
  scale_fill_brewer(palette="Set3")+
  geom_text(aes(label = prod_nm), vjust = -0.2)+
  scale_x_continuous(breaks=c(1:10)) + 
  scale_y_continuous(breaks=seq(0, 80, 5)) +
  theme_bw()+
  xlab("Ranking")+
  ylab("점유율(%)")+
  labs(fill="요금제명")+
  ggtitle("2017 이마트 가입자가 사용중인 기본요금제 Top10")



# SK텔링크
# 아이즈비전
# 유니컴즈
# 큰사람
# 스마텔
# 이마트
# 에스원
# 프리텔레콤
# CJ헬로비전
# 에넥스텔레콤
# 조이텔


# View(emrt)

