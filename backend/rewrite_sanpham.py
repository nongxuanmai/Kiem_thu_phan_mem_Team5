
# Script viết lại dữ liệu mẫu SanPham với ảnh đúng từng danh mục

products = [
    # id_dm=1: Túi Xách Tay (TuiXach/tx1-tx15)
    (1,'Túi Xách Tay Nữ Luxury',1250000,50,'TuiXach/tx1.png','Đen','Da bò thật','30x20x12 cm','Túi xách tay thiết kế sang trọng, phù hợp đi làm và dự tiệc.',1),
    (2,'Túi Xách Tay Công Sở Da Saffiano',1350000,30,'TuiXach/tx2.png','Đen','Da Saffiano','32x22x13 cm','Thiết kế đứng dáng thanh lịch, phù hợp môi trường công sở.',1),
    (3,'Túi Xách Tay Nữ Retro Cổ Điển',850000,25,'TuiXach/tx3.png','Nâu Bò','Da tổng hợp','28x19x10 cm','Phong cách cổ điển, quai xách tròn êm ái, màu vintage dễ phối đồ.',1),
    (4,'Túi Xách Canvas Quai Da',420000,50,'TuiXach/tx4.png','Trắng Kem','Canvas phối Da','35x27x12 cm','Kết hợp canvas mộc mạc và quai xách da sang trọng.',1),
    (5,'Túi Xách Tay Cỡ Lớn Du Lịch',950000,20,'TuiXach/tx5.png','Xám','Vải Polyester','45x28x18 cm','Túi du lịch cỡ lớn, vải chống thấm nước tiện lợi.',1),
    (6,'Túi Xách Tay Da Cá Sấu Vân Nổi',2200000,15,'TuiXach/tx6.png','Đỏ Đô','Da bò dập vân cá sấu','29x20x11 cm','Sang trọng bậc nhất với vân cá sấu dập nổi tinh xảo.',1),
    (7,'Túi Xách Tay Tròn Độc Đáo',750000,18,'TuiXach/tx7.png','Vàng Mù Tạt','Da PU','25x25x8 cm','Dáng tròn độc đáo đầy cá tính, điểm nhấn dạo phố.',1),
    (8,'Túi Xách Tay Mềm Minimalist',890000,40,'TuiXach/tx8.png','Xám Nhạt','Da PU mềm','30x21x12 cm','Tối giản, phom dáng mềm mại thoải mái.',1),
    (9,'Túi Xách Tay Nhung Đính Ngọc Trai',690000,12,'TuiXach/tx9.png','Đen','Vải Nhung','24x17x8 cm','Chất nhung quý phái, quai xách đính ngọc trai tinh xảo.',1),
    (10,'Túi Xách Tay Phong Cách Hàn Quốc',520000,35,'TuiXach/tx10.png','Xanh Pastel','Da PU','26x18x9 cm','Pastel ngọt ngào, trẻ trung chuẩn style Hàn Quốc.',1),
    (11,'Túi Xách Tay Da Thật Cao Cấp',1850000,10,'TuiXach/tx11.png','Nâu Đậm','Da bò thật','31x23x12 cm','100% da bò nguyên tấm, độ bền vượt trội theo thời gian.',1),
    (12,'Túi Xách Tay Thời Thượng Nữ',1100000,22,'TuiXach/tx12.png','Be','Da PU','27x18x10 cm','Thiết kế thời thượng, dễ phối đồ công sở và dạo phố.',1),
    (13,'Túi Xách Tay Hoa Văn Nổi Bật',780000,28,'TuiXach/tx13.png','Đỏ','Da PU dập hoa văn','29x19x11 cm','Hoa văn nổi bật tạo điểm nhấn phong cách.',1),
    (14,'Túi Xách Tay Sang Trọng Premium',1680000,8,'TuiXach/tx14.png','Đen','Da bò thật cao cấp','33x24x13 cm','Dòng premium với đường may tỉ mỉ, khóa kim loại bền đẹp.',1),
    (15,'Túi Xách Tay Năng Động Trẻ Trung',650000,32,'TuiXach/tx15.png','Xanh Navy','Da PU','28x18x9 cm','Kiểu dáng năng động, màu xanh navy trẻ trung dễ phối.',1),
    # id_dm=2: Túi Đeo Chéo (TuiDeoCheo/tc1-tc15)
    (16,'Túi Đeo Chéo Mini Năng Động',450000,100,'TuiDeoCheo/tc1.png','Nâu','Da PU','18x12x6 cm','Nhỏ gọn, tiện lợi đi chơi và dạo phố. Trẻ trung, năng động.',2),
    (17,'Túi Đeo Chéo Da Thật Cỡ Trung',950000,30,'TuiDeoCheo/tc2.png','Nâu','Da bò thật','23x15x7 cm','Tối giản thanh lịch, da thật mềm mịn chịu lực tốt.',2),
    (18,'Túi Đeo Chéo Thể Thao Unisex',350000,60,'TuiDeoCheo/tc3.png','Đen','Vải Oxford','28x18x8 cm','Năng động thể thao, chống nước, hợp cả nam và nữ.',2),
    (19,'Túi Đeo Chéo Bán Nguyệt Thời Trang',480000,45,'TuiDeoCheo/tc4.png','Kem','Da PU','22x14x6 cm','Dáng bán nguyệt hot trend, ôm sát người, dễ phối đồ basic.',2),
    (20,'Túi Đeo Chéo Đựng iPad Tiện Lợi',580000,35,'TuiDeoCheo/tc5.png','Xanh Navy','Canvas phối da','26x20x6 cm','Vừa máy tính bảng, có đệm mút chống sốc bảo vệ thiết bị.',2),
    (21,'Túi Đeo Chéo Nữ Chần Bông',650000,20,'TuiDeoCheo/tc6.png','Trắng','Da PU chần bông','20x13x6 cm','Họa tiết chần bông hình quả trám, khóa xoay mạ vàng sang trọng.',2),
    (22,'Túi Đeo Chéo Mini Đựng Điện Thoại',250000,80,'TuiDeoCheo/tc7.png','Hồng Nhạt','Da PU','18x11x4 cm','Siêu nhỏ gọn, chỉ vừa điện thoại và son, dạo phố nhẹ nhàng.',2),
    (23,'Túi Đeo Chéo Tua Rua Boho',520000,15,'TuiDeoCheo/tc8.png','Nâu Tây','Da lộn','24x18x5 cm','Chi tiết tua rua cá tính, phong cách du mục Boho phóng khoáng.',2),
    (24,'Túi Đeo Chéo Hộp Vuông Cứng Cáp',590000,25,'TuiDeoCheo/tc9.png','Xanh Lá','Da PU cứng','19x14x8 cm','Dáng hộp vuông hiện đại, màu xanh lá nổi bật thời trang.',2),
    (25,'Túi Đeo Chéo Nắp Gập Khóa Nam Châm',460000,40,'TuiDeoCheo/tc10.png','Đen','Da PU','21x15x7 cm','Nắp gập đơn giản, khóa nam châm tiện lợi khi đóng mở.',2),
    (26,'Túi Đeo Chéo Trong Suốt Đi Sự Kiện',300000,50,'TuiDeoCheo/tc11.png','Không màu','Nhựa PVC cao cấp','20x15x6 cm','PVC trong suốt thời thượng, kèm ví nhỏ đựng đồ riêng tư.',2),
    (27,'Túi Đeo Chéo Da Bò Cao Cấp',1050000,18,'TuiDeoCheo/tc12.png','Đen','Da bò thật','22x16x7 cm','Đường may tỉ mỉ, khóa kim loại bền đẹp theo năm tháng.',2),
    (28,'Túi Đeo Chéo Phong Cách Trẻ',420000,55,'TuiDeoCheo/tc13.png','Đỏ','Da PU','20x14x6 cm','Màu đỏ nổi bật cá tính, nhiều ngăn tiện lợi.',2),
    (29,'Túi Đeo Chéo Da Nhăn Vintage',680000,22,'TuiDeoCheo/tc14.png','Nâu Đất','Da PU nhăn','25x17x7 cm','Vân da nhăn vintage độc đáo, phong cách cổ điển bền thời gian.',2),
    (30,'Túi Đeo Chéo Kẻ Ô Thời Trang',380000,45,'TuiDeoCheo/tc15.png','Đen Trắng','Canvas kẻ ô','23x16x6 cm','Họa tiết kẻ ô cổ điển, năng động dễ kết hợp nhiều set đồ.',2),
    # id_dm=3: Túi Đeo Vai (TuiDeoVai/tv1-tv10, thiếu tv8)
    (31,'Túi Đeo Vai Boho Thổ Cẩm',680000,75,'TuiDeoVai/tv1.png','Be','Canvas','35x28x10 cm','Phong cách Boho độc đáo, họa tiết thổ cẩm ấn tượng.',3),
    (32,'Túi Đeo Vai Kẹp Nách Baguette',550000,45,'TuiDeoVai/tv2.png','Đen','Da PU bóng','26x13x5 cm','Dáng baguette kẹp nách cổ điển 90s, sành điệu và tôn dáng.',3),
    (33,'Túi Đeo Vai Dây Xích Sang Trọng',750000,30,'TuiDeoVai/tv3.png','Trắng','Da PU','28x17x8 cm','Quai đeo phối xích mạ vàng, có thể đeo vai hoặc đeo chéo.',3),
    (34,'Túi Đeo Vai Hobo Da Mềm',690000,25,'TuiDeoVai/tv4.png','Nâu','Da tổng hợp mềm','32x25x10 cm','Dáng hobo thụng tự nhiên, da mềm mại, ngăn chứa rộng rãi.',3),
    (35,'Túi Đeo Vai Canvas Cỡ Lớn',320000,70,'TuiDeoVai/tv5.png','Trắng Kem','Vải Canvas','38x32x10 cm','Tối giản năng động, đựng vừa sách vở và laptop.',3),
    (36,'Túi Đeo Vai Da Vân Cá Sấu',820000,18,'TuiDeoVai/tv6.png','Đỏ Rượu','Da PU dập vân','27x16x7 cm','Quai bản to êm vai kết hợp vân cá sấu quý phái.',3),
    (37,'Túi Đeo Vai Xếp Ly Độc Đáo',490000,30,'TuiDeoVai/tv7.png','Vàng Kem','Da PU mềm','25x18x8 cm','Xếp ly ở miệng túi tạo độ bồng bềnh nữ tính, cực xinh.',3),
    (38,'Túi Đeo Vai Công Sở Dáng Đứng',890000,20,'TuiDeoVai/tv9.png','Xanh Rêu','Da Microfiber','30x28x11 cm','Microfiber cao cấp chống trầy xước, phom đứng lịch sự.',3),
    (39,'Túi Đeo Vai Vải Dù Chống Nước',420000,55,'TuiDeoVai/tv10.png','Đen','Vải Nylon dù','33x24x9 cm','Siêu nhẹ, chống thấm nước tuyệt đối, đi mưa nhẹ thoải mái.',3),
    # id_dm=4: Balo (Balo/bl1-bl13)
    (40,'Balo Du Lịch Thời Trang',890000,60,'Balo/bl1.png','Xanh Navy','Vải Oxford','45x30x20 cm','Thiết kế thông minh nhiều ngăn, chống nước, đi dài ngày.',4),
    (41,'Balo Laptop 15.6 inch Chống Trộm',980000,30,'Balo/bl2.png','Xám Đậm','Vải Polyester chống rách','44x31x14 cm','Khóa kéo ẩn chống trộm, ngăn đệm chống sốc bảo vệ laptop.',4),
    (42,'Balo Da Nữ Mini Dễ Thương',490000,45,'Balo/bl3.png','Hồng Đất','Da PU','25x20x10 cm','Balo mini nhỏ gọn, quai đeo tùy chỉnh làm túi đeo chéo.',4),
    (43,'Balo Học Sinh Canvas Nhiều Ngăn',380000,60,'Balo/bl4.png','Vàng Nhạt','Vải Canvas','40x29x12 cm','Nhiều ngăn đựng bút thước, sách vở, bình nước.',4),
    (44,'Balo Chống Nước Cao Cấp Nam',850000,25,'Balo/bl5.png','Đen','Nhựa PVC phối dù','43x30x13 cm','Kháng nước bóng loáng, thiết kế hộp vuông thời thượng.',4),
    (45,'Balo Phượt Dã Ngoại 40L',1200000,15,'Balo/bl6.png','Rằn Ri','Vải Oxford 900D','55x35x20 cm','Dung tích 40L cho chuyến trekking dài ngày, đai trợ lực êm.',4),
    (46,'Balo Thời Trang Da Mềm Nữ',650000,35,'Balo/bl7.png','Nâu Nhạt','Da PU mềm','30x26x11 cm','Khóa kéo hai chiều thời trang, phom tròn trịa nữ tính.',4),
    (47,'Balo Mini Nhung Tăm Năng Động',350000,50,'Balo/bl8.png','Xanh Bơ','Vải nhung tăm corduroy','24x18x9 cm','Nhung tăm mềm mại vintage, màu xanh bơ trẻ trung thu hút.',4),
    (48,'Balo Đựng Đồ Cho Mẹ Và Bé',550000,20,'Balo/bl9.png','Xanh Mint','Vải Polyester chống thấm','42x32x15 cm','Ngăn giữ ấm bình sữa và nhiều ngăn chia tã lót bỉm.',4),
    (49,'Balo Unisex Thời Trang Hàn Quốc',450000,40,'Balo/bl10.png','Trắng Phối Đen','Vải dù','41x30x12 cm','Basic năng động dễ dùng cho cả nam và nữ.',4),
    (50,'Balo Công Sở Da Thật Cao Cấp',1950000,10,'Balo/bl11.png','Đen','Da bò thật','39x29x10 cm','Da bò cao cấp nguyên tấm, tôn phong thái chuyên nghiệp.',4),
    (51,'Balo Thể Thao Chống Nước',680000,38,'Balo/bl12.png','Xám','Vải Polyester không thấm nước','43x28x13 cm','Thiết kế thể thao, chống thấm hoàn toàn, ngăn giày riêng biệt.',4),
    (52,'Balo Du Lịch Gấp Gọn',320000,55,'Balo/bl13.png','Xanh Lá','Nylon siêu nhẹ','38x24x10 cm','Gấp gọn vừa túi áo, mở ra thành balo đầy đủ tiện lợi.',4),
    # id_dm=5: Ví (Vi/v1-v11)
    (53,'Ví Dài Nữ Cao Cấp',320000,120,'Vi/v1.png','Hồng','Da PU','19x9x2 cm','Nhiều ngăn đựng thẻ và tiền, da PU mềm mại sang trọng.',5),
    (54,'Ví Gập Ba Nam Da Thật',450000,50,'Vi/v2.png','Nâu Đen','Da bò thật','11x9x2 cm','Gập ba nhỏ gọn, đựng vừa giấy tờ tùy thân và tiền mặt.',5),
    (55,'Ví Cầm Tay Nữ Quai Móc Cổ Tay',390000,40,'Vi/v3.png','Đen','Da PU hạt','20x10x2 cm','Quai đeo cổ tay chống cướp giật, nhiều ngăn đựng thẻ.',5),
    (56,'Ví Đựng Thẻ Card Holder Siêu Mỏng',180000,100,'Vi/v4.png','Xám','Da saffiano','10x7x0.5 cm','Siêu mỏng đựng vừa túi quần, cho người chuộng thanh toán thẻ.',5),
    (57,'Ví Đựng Passport Da Thật',280000,30,'Vi/v5.png','Nâu Đỏ','Da bò thật','14x10x1 cm','Bảo vệ hộ chiếu, vé máy bay và các loại thẻ khi du lịch.',5),
    (58,'Ví Nữ Ngắn Gập Đôi Hoa Cúc',220000,60,'Vi/v6.png','Vàng Nhạt','Da PU','12x9x2 cm','Họa tiết thêu hoa cúc xinh xắn, nút bấm chắc chắn.',5),
    (59,'Ví Cầm Tay Unisex Khóa Kéo Vòng',350000,45,'Vi/v7.png','Đen','Da PU','19x10x2.5 cm','Khóa kéo kim loại bo tròn an toàn, đựng cả điện thoại cỡ vừa.',5),
    (60,'Ví Mini Đựng Tiền Xu',120000,120,'Vi/v8.png','Hồng Pastel','Silicone cao cấp','8x8x3 cm','Silicone chống nước dễ vệ sinh, đựng tiền xu hoặc tai nghe.',5),
    (61,'Ví Da Nam Vân Sọc Chéo',420000,35,'Vi/v9.png','Xanh Navy','Da bò dập vân','12x10x1.5 cm','Dập vân sọc chéo trẻ trung lịch lãm, chống xước tốt.',5),
    (62,'Ví Cầm Tay Dự Tiệc Đính Đá',580000,20,'Vi/v10.png','Bạc','Vải Satin đính đá','20x11x3 cm','Đính đá pha lê lấp lánh phản quang đẹp dưới ánh đèn sân khấu.',5),
    (63,'Ví Đựng Chìa Khóa Ô Tô Da Thật',250000,70,'Vi/v11.png','Đen','Da bò thật','10x5x2 cm','Móc khóa kim loại xoay 360 độ, bảo vệ chìa khóa ô tô.',5),
    # id_dm=6: Túi Clutch (TuiClutch/tc1-tc9)
    (64,'Túi Clutch Dạ Tiệc',550000,40,'TuiClutch/tc1.png','Vàng','Vải nhung','22x13x3 cm','Clutch sang trọng dạ tiệc, đính hạt pha lê lấp lánh thu hút.',6),
    (65,'Clutch Dạ Tiệc Dáng Hộp Kim Loại',690000,20,'TuiClutch/tc2.png','Vàng Gold','Khung kim loại + Satin','18x11x5 cm','Dáng hộp cứng cáp viền vàng gold sang trọng, kèm dây xích dài.',6),
    (66,'Clutch Da Thật Cầm Tay',1200000,15,'TuiClutch/tc3.png','Đen','Da bò thật','26x17x4 cm','Phong cách doanh nhân lịch lãm, khóa số bảo mật an toàn.',6),
    (67,'Clutch Vải Nhung Xếp Ly Nữ',480000,25,'TuiClutch/tc4.png','Đỏ Rượu','Vải nhung','22x12x4 cm','Xếp ly bồng quý phái, quai xách đính cườm điệu đà dự tiệc.',6),
    (68,'Clutch Cầm Tay Minimalist Da Mềm',550000,30,'TuiClutch/tc5.png','Kem','Da PU mềm','24x15x3 cm','Trơn tối giản thanh lịch, phù hợp mọi set đồ.',6),
    (69,'Clutch Đính Ngọc Trai Toàn Thân',890000,10,'TuiClutch/tc6.png','Trắng Ngọc Trai','Hạt ngọc nhân tạo','19x12x5 cm','Kết ngọc trai toàn bộ bề mặt, mang vẻ quý tộc kiêu sa.',6),
    (70,'Clutch Bì Thư Bản To Công Sở',380000,40,'TuiClutch/tc7.png','Xám','Da PU','30x20x2 cm','Dáng bì thư dẹt đựng vừa tài liệu nhỏ hoặc máy tính bảng.',6),
    (71,'Clutch Cầm Tay Họa Tiết Thêu Hoa',520000,18,'TuiClutch/tc8.png','Đen Thêu Hoa','Vải Linen thêu tay','23x14x3 cm','Hoa cúc thêu tay tỉ mỉ, mang nét đẹp truyền thống thanh tao.',6),
    (72,'Clutch Ngọc Trai Viền Xích Cá Tính',750000,12,'TuiClutch/tc9.png','Đen phối Bạc','Da PU + Kim loại','20x13x4 cm','Ngọc nữ tính kết hợp dây xích bạc hầm hố phá cách.',6),
]

header = """-- Dữ liệu mẫu SanPham
INSERT OR IGNORE INTO SanPham (id_sp, ten_sp, gia_sp, soluong_sp, anh_sp, mausac_sp, chatlieu_sp, kichthuoc_sp, mota_sp, id_dm)
VALUES \n"""

rows = []
for p in products:
    rows.append(
        f"    ({p[0]}, '{p[1]}', {p[2]}, {p[3]}, '{p[4]}', '{p[5]}', '{p[6]}', '{p[7]}', '{p[8]}', {p[9]})"
    )
sql_block = header + ",\n".join(rows) + ";\n"

sql_file = r"d:\web bán túi\Kiem_thu_phan_mem_Team5\backend\init_db.sql"
with open(sql_file, "r", encoding="utf-8") as f:
    content = f.read()

import re
new_content = re.sub(
    r"-- Dữ liệu mẫu SanPham.*?;",
    sql_block.rstrip("\n"),
    content,
    flags=re.DOTALL
)

with open(sql_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print("✅ Đã viết lại dữ liệu mẫu SanPham thành công!")
print(f"   Tổng số sản phẩm: {len(products)}")
print(f"   - Túi Xách Tay (id_dm=1): 15 sản phẩm, ảnh TuiXach/tx1-tx15.png")
print(f"   - Túi Đeo Chéo (id_dm=2): 15 sản phẩm, ảnh TuiDeoCheo/tc1-tc15.png")
print(f"   - Túi Đeo Vai  (id_dm=3):  9 sản phẩm, ảnh TuiDeoVai/tv1-tv10.png")
print(f"   - Balo         (id_dm=4): 13 sản phẩm, ảnh Balo/bl1-bl13.png")
print(f"   - Ví           (id_dm=5): 11 sản phẩm, ảnh Vi/v1-v11.png")
print(f"   - Túi Clutch   (id_dm=6):  9 sản phẩm, ảnh TuiClutch/tc1-tc9.png")
