import { extractAddresses } from
  "../src/server/modules/address/addressExtractor.service";

const samples = [
  `OPPA CHICKEN 15 Đ. Ung Văn Khiêm, Phường 25, Bình Thạnh, Hồ Chí Minh 0934162416 -25kg bánh gạo thỏi - 1.200 ck sau 1.200 ship 40  --- Tên cty: CÔNG TY TNHH THỰC PHẨM HÀN QUỐC T&G Mst: 0318594080 Địa chỉ: 15 Ung Văn Khiêm, phường Thạnh Mỹ Tây, thành phố Hồ Chí Minh, Việt Nam Sdt: 0934162416 Email: phuhao.carton@gmail.com`,

  `Tên ng nhận: Thảo  Sdt: 0947924113  Địa chỉ: toà Le - Lexington, 67 Mai chí thọ, q2 1 set Nước Mơ Xanh Woongjin 180ml - 225  1 set Nước Trái Lựu Woongjin 180ml - 225  ship 50 thu khách 500  CÔNG TY TNHH OLIVE ĐỊA CHỈ: 8-LK4, Khu Nhà ở Thương mại tại Tổ 6, Phường Xuân Phương, Thành phố Hà Nội, Việt Nam MST: 0107622324 Gmail: vanthao1939@gmail.com`,

  `gửi hàng giùm mình hnay:  V309, đường V3,vinhome Grand Park, phường Long bình, thủ đức 0368001116 Phúc -5kg sốt tok - 190 Ship 60 Ck 250 --- CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ PDA VIỆT NAM MST: 0319163312 Số 09 đường V3, Dự án khu dân cư và công viên Phước Thiện, khu phố Phước Thiện, Phường Long Bình, Thành phố Hồ Chí Minh, Việt Nam`,

  `HTL`,

  `Thông tin giao hàng Linh_ 0395371704 5kg bgpm1 -500 Ship 50 thu khách 550  Đc: số 07 đường D10, phường Bình Trưng Tây, tp thủ đức THÔNG TIN XHĐ  TÊN CTY:  CÔNG TY CỔ PHẦN HASHTAGLIFE MST: 0315955677 ĐỊA CHỈ: 03 Đường Trần Quý Kiên, Khu phố 1, Phường Cát Lái, Thành phố Hồ Chí Minh, Việt Nam EMAIL: ketoan.hashtagecos@gmail.com`,
  `GIAO ĐÚNG ĐỊA CHỈ  Địa chỉ: 39 Nguyễn Duy Hiệu , Phường An Khánh, Thành phố Hồ Chí Minh , Việt Nam  0343855035 2 Ớt bột cấp độ Chungwoo 600g-434 2 Củ cải vàng cắt lát Haeju Farm 1kg-130 ship 50 thu khách 614  --------------- Tên công ty : NHÀ HÀNG PIRIPARAPO - CHI NHÁNH CÔNG TY TNHH MADE BY FREAK MST : 0318623817-001 Địa chỉ: 39 Nguyễn Duy Hiệu , Phường An Khánh, Thành phố Hồ Chí Minh , Việt Nam Mail :  piriparapo.yatai@gmail.com`,
  `Thông tin giao hàng Linh_ 0395371704 5kg bgpm1 -500 Ship 50 thu khách 550  Đc: số 07 đường D10, phường Bình Trưng Tây, tp thủ đức THÔNG TIN XHĐ  TÊN CTY:  CÔNG TY CỔ PHẦN HASHTAGLIFE MST: 0315955677 ĐỊA CHỈ: 03 Đường Trần Quý Kiên, Khu phố 1, Phường Cát Lái, Thành phố Hồ Chí Minh, Việt Nam EMAIL: ketoan.hashtagecos@gmail.com`,
  `T2 GIAO SAU 16H  CHUYỂN XBG Yakitori Kitchen 03356296567  hẻm 30 đường số 9 phương An Khánh, tp hcm- 10 Bánh gạo 2cm 400g - 265 ship 50 thu khách 315  CÔNG TY TNHH 80BROS Đc: số 7 đường số 9 phường An Khánh, Thành phố Hồ Chí Minh MST: 0318763074 Gmail: 80bros.vn@gmail.com`,
  `143 Tôn thất thuyết p15 quận 4 0372577179 -50 Mì udon tươi Rainbow Food 100g- 450 -50 sốt trong - 1.900 ck 2.350 ship 35  ------------------------- ‼️Xuất hđ dùm e  143 tôn thất thuyết , phường khánh hội , Thành phố Hồ Chí Minh Hộ kinh doanh Nâu Food  MST 079197018503 Mail: naufood062015@meinvoice.vn`,
  `624 Nguyễn Duy Trinh, Phường Bình Trưng Anh Nam- 0937533326, Hân 0906652586 -10kg bánh gạo cắt lát - 480 ship 50 thu khách 530`,
  `khMethanhnhantd Hoa 18 Hồ Văn Tư, P. Trường Thọ, Q.Thủ Đức 0702508173 -22 kg bg thỏi - 1056 thu khách 1.056 ship 50`,
  `THỨ 4 GIAO TRƯỚC 10H30, GỌI NHÀ XE CHECK TRƯỚC KHI GIAO Địa chỉ e : chợ phước hải , đối diện cafe bom bom Trinh - 0344770072 -10 Chả cá Hàn Quốc xiên sẵn Heyn 1kg (20 xiên) - 1.000 CK 1.000 ship 40  Tphcm về : 10h30 :(224 quốc lộ 13 phường 26 quận Bình Thạnh ) Alo 0903864924 Nhà xe minh huy`,
  `32 trân hung dạo phuong ben thanh q1 0939752521 100 vắt ramen rainbow 800 30 vắt udon rainbow 270k ship 20 thu khách 1070k`,
  `Chành xe Thu Minh: 65 Chu Văn An, p1, q6 Số xe: 60C-35961 Sđt tài xế: 0932733122 - a Hưng Người nhận : 090 2952654 - A. Dũng Địa chỉ nhận : đường D12, khu D2D, p.Thống Nhất, Biên Hoà - Đồng Nai -1 Tương ớt gochujang Sempio 14kg (Thùng)- 805 ship 30 CK 835 -- CÔNG TY TNHH MỘT THÀNH VIÊN SẢN XUẤT THƯƠNG MẠI DỊCH VỤ TÔ MINH - Địa chỉ mới: VPGD: Tầng 1, số 328, đường 30/4, Khu Phố Trung Dũng, Phường Trấn Biên, Thành Phố Ðồng Nai, Việt Nam - Mã số thuế: 3603417670 - Email nhận hoá đơn: hoadon@tominh.vn`,
  `2H XE CHẠY 368, Hùng Vương, p3, tp Tân An, Long An 0789973976 -17 kg bgpm1 - 1.700 CK 1.700 ship 30  Nhà xe lộc tỷ`,
  `SÁNG THỨ 2 GỬI SỚM 0919719713 Anh Phong 60 Tố Hữu Cam Ranh 10  Chả cá Hàn Quốc xiên sẵn Heyn 1kg (20 xiên) -1.050 20 Súp chả cá Hàn Quốc King Omuk 120g-500 15kg bg thỏi -720  1 Nước tương Jin Chungjungone 1.7L-140 ck 2.410.000 ship 20  Nhà xe Khanh Phong  -------------------------- THÔNG TIN XUẤT HD: Tên: HỘ KINH DOANH BUSAN CHICKEN Mã số thuế: 056095005166 Địa chỉ: Đường Tố Hữu, TDP Lộc Hải, Phường Cam Ranh, Khánh Hòa, Việt Nam Email: busanchickencr@gmail.com`,
  `Kim Thoa - 0973865198 Ấp chánh.đức lập thượng .đức hoà long an -7kg bg thỏi - 336 -1  Bột phô mai Yary 1kg- 175 ship 20 ck 531 XE THỪA-NHUNG( CHÀNH SỐ 8, BẾN BÃI SẬY P13 Q5, 0374930257, NHẬN HÀNG TỪ 10H-13H)`,
  `CHUYỂN XBG ĐÓNG 1 THÙNG  Phúc Mỹ Tho - 0349522351 10kg bg thỏi - 450 2 Phô mai bột parmesan Morinaga 1kg-800 đơn 1.250 nợ cũ 2.794 tổng ck 4.044 ship 30   chành xe mười gà 0908466252`,
  `ĐỔI THÙNG KHÁC, ĐÓNG CHỤP LẠI TRƯỚC KHI GỬI Phúc - 0977925269 Gửi xe Hùng Cường về Long Xuyên -6 can Sốt Teriyaki Ottogi 2.25kg - 1.002 ck 927 ( cấn trừ đơn trước )  Tên đơn vị: HỘ KINH DOANH NHÍMS HOUSE Mã số thuế: 089086027465 Địa chỉ: 50A Tôn Đức Thắng, Phường Long Xuyên, Tỉnh An Giang, Việt Nam dinhlan922@gmail.com`,
  `T3 có hàng báo khách Thuỷ -0374635337 R1-01 Nguyễn Thị Nghĩa, phường xuân hương, thành phố đà lạt 20 Bánh gạo xúc xích xiên 300g - 720  Ship 20 ck 740 Gửi Xe Thành Bưởi ------------------------- HỘ KINH DOANH GANGNAM UNNI CHICKEN & PIZZA Trần Hoàng Thảo Nguyên 068199002355 94 Bùi Thị Xuân, phường xuân hương, đà lạt`,
  `Địa chỉ:123 đường 30, phường Tân Hưng, TPHCM Sdt 0785208468 1 Bột đậu nành rang kinako Gishi 80g - 55 ship 35 ck 90 --------------- thông tin xuất hóa đơn: Tên công ty: CÔNG TY CỔ PHẦN LEARTH VIỆT NAM Mã số thuế: 0313658446 Địa chỉ: 123 Đường số 30, KDC An Phú Hưng, Phường Tân Hưng, Thành Phố Hồ Chí Minh, Việt Nam Email: input.lvn@gmail.com`,
  `ĐÓNG 2 THÙNG GIÚP KHÁCH THÙY MỴ BMT ■0905302132 -50kg bánh gạo thỏi - 2.400 (lấy bao đỏ) CK 2.400 ship 20 Nhà Xe Hiệp Trang`,
  `Hoàng Anh 0902074983 319 tôn đản q4 5kg bánh gạo cắt lát - 240 Ship 35 thu khách 275`,
  `CHUYỂN PHIẾU XBG Thúy Vy BMT ■ 0914142604 -30kg bg - 1.440.000 CK 1.440.000 ship 35 Xe Thanh Khuê A75/68 Bạch Dang, P2, Tân Bình 0283842176 CK TAE OH ---------------------- Xuất HD vat MST: 6001795134 CÔNG TY TNHH SẢN XUẤT THƯƠNG MẠI & DỊCH VỤ THÚY VY Số 395 N Phan Chu Trinh, Phường Buôn Ma Thuột, Tỉnh Đắk Lắk, Việt Nam thuyvy142604@gmail.com VAT TAE OH`,
  `NGUYỄN ANH HUY  0797433056  gửi về Cai Lậy, Tiền Giang -10kg bg thỏi-480 -2kg bgpm1 - 200  ship 20 ck 700 XE HẢI DUYÊN`,
  `Giao trước 11h Ánh Tuyết 0964769740 415, quốc lộ 13, thị trấn Lộc Ninh, Lộc Ninh Bình Phước -10kg bg thỏi - 480 -10kg bgpm 1 - 1.000 -10 bg hoa sao tim - 480 -5kg Chả Cá HQ Nhập Khẩu Sajo 1kg - 575 -1 Mandu mini nhân thịt Bibigo 990g - 135 -1 Bánh bạch tuộc Takoyaki Isshinfood 1.2kg -  155 -1 Phô mai que LC Foods 500g - 70 ck 2.895 ship 20   Nhà Xe Huy Hiếu - 0938981298 ----------- MST : 070099006865 HỘ KINH DOANH GAMOFOOD Số 415, QL 13, KP Ninh Thái, Xã Lộc Ninh, Đồng Nai gửi mail contactgamofood@gmail.com`,
  `0833294905 Kiều Thanh Liêm 0911393499 10 Lý Thường Kiệt, Phan Rang -5 Gạo Japonica Tèobokki 5kg - 620 ship 20 ck 640  => GIAO HÀNG Ở NHÀ XE QUỐC TRUNG (SÀI GÒN - PHAN RANG)  199 Trần Phú, P4, Quận 5`,
  `Quốc Quân - Sđt 0901.777.766 -1 thùng( 34gói ) Nước cốt lẩu Thái Tomyum Haidilao 210g - 1.632 ck 1.632 ship 25   Nhà xe Anh Tuấn 65 Đường số 2, Cư xá Bình Thới, Phường 8, Quận 11. ----------------- Công ty tnhh song tín group Đc : thừa đất số 239, tờ bản đồ số 16, ấp mỹ tường 1, xã vĩnh thanh, tỉnh cà mau  Mst: 1900.712.379`,
  `Người nhận: Quân 0977101610 gửi về bến Phước bình_ bình phước -10 Bánh xếp nhân thịt Bibigo 1.505kg - 1.500 -10 Sốt tteokbokki túi trong 1kg - 380 ck 1.880 ship 20  Xe Thành Công LHP Q10`
];

for (const sample of samples) {
  console.log("\nINPUT:", sample);
  console.dir(extractAddresses(sample), {
    depth: null,
  });
}