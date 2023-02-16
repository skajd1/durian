# Durian 영화예매사이트
### node.js express website project
#### [홈페이지](http://ec2-52-69-189-126.ap-northeast-1.compute.amazonaws.com:8080)
#### [노션 페이지](https://rhinestone-princess-612.notion.site/a8d4a14df5e8450b87680a7ae78cc2b4)
**어드민 계정** ( ID : admin | PW : admin ) - 사이트 내 어드민 페이지로 가는 버튼이 활성화되어 영화, 상영개체 및 유저 DB 등을 수정할 수 있다. <br>
**게스트 계정** ( ID : guest | PW : guest ) - 일반 사용자 계정으로, 영화 예매 및 내역 확인 등의 기능을 수행할 수 있다.

상단 네비바에 있는 회원가입 링크에서 가입을 진행 후 (혹은 어드민 계정으로 로그인 후 여러 기능들을 사용할 수 있음.) 사이트 내부 기능을 이용할 수 있다.


### 일반 계정 or 비로그인 상태 
#### 마우스를 영화 포스터에 올리면 해당 영화의 정보가 출력되고, 예매하기 버튼을 눌러 정보를 입력하는 창으로 이동한다.
![image](https://user-images.githubusercontent.com/86655177/219231399-9acc80f4-652f-4589-a9aa-cb88f6ba437f.png)

### 어드민 계정 
#### 어드민 계정일 때만 버튼이 활성화 되며, 다른 계정 혹은 비로그인상태로 접근하면 경고 메시지 출력
![image](https://user-images.githubusercontent.com/86655177/219231722-69cfc729-a97b-4158-893c-031b7d02e2f0.png)

### 영화/극장/날짜/시간 선택 화면 
#### 비동기 처리를 이용해 선택 가능한 항목만 활성화 되어 직관적인 UI를 제공할 수 있다.
![image](https://user-images.githubusercontent.com/86655177/219233653-0c5b5a86-35b7-4ff4-bce8-65cf06caf051.png)
![image](https://user-images.githubusercontent.com/86655177/219233931-c9716233-83b3-4e72-bae8-dd194a56ff41.png)

### 좌석 선택 화면
#### 현재 예매 가능한 좌석을 표시하며, 설정한 인원과 좌석을 선택한 인원이 동일해지면 결제 버튼이 활성화 된다.
![image](https://user-images.githubusercontent.com/86655177/219235058-45addfd9-3a91-4504-995b-00d962f1ba3c.png)
![image](https://user-images.githubusercontent.com/86655177/219235109-6db79982-b22c-41ed-9c15-a42808b4c01f.png)

### 예매 상세 내역
#### 포인트가 충분하고, 결제가 잘 이루어지면 다음과 같이 내역을 확인할 수 있는 화면으로 이동한다. 티켓 출력을 누르면 QR코드가 팝업으로 나타나서, 이를 스마트폰으로 찍으면 핸드폰에서도 내역을 간단하게 확인할 수 있다. <br>
#### 아직 상영중인 영화에 대해서는 예매 취소를 할 수 있다.
![image](https://user-images.githubusercontent.com/86655177/219236096-93c91f8a-2105-4f78-b60b-31ff8b2116e4.png)

### 마이페이지
#### 내 정보나 예매 내역, 비밀번호 수정 등을 할 수 있다.
![image](https://user-images.githubusercontent.com/86655177/219236928-57ab022e-7b84-45f2-aa37-b56bc7f4a438.png)
![image](https://user-images.githubusercontent.com/86655177/219236972-d140a7ce-7a57-4ae8-a1d6-cb94a472fd2c.png)
![image](https://user-images.githubusercontent.com/86655177/219237009-7543aba2-9eae-4b11-985b-0330479847ab.png)

### 어드민페이지
#### 다음과 같이 DB들을 추가/수정/삭제 할 수 있다.
![image](https://user-images.githubusercontent.com/86655177/219238034-8cc8be38-6ec1-4057-82bf-d8a140afe79b.png)
![image](https://user-images.githubusercontent.com/86655177/219238061-412508a9-2429-4c13-98ac-b0ef530835a8.png)
![image](https://user-images.githubusercontent.com/86655177/219238231-576891b9-8d92-4e80-a923-b146a0cf46c1.png)
![image](https://user-images.githubusercontent.com/86655177/219238347-2786bb14-6a8f-4c3d-a2ca-7c06487ef029.png)
![image](https://user-images.githubusercontent.com/86655177/219238360-d9fe8023-2db3-41c1-bae2-ab0c439c4448.png)







