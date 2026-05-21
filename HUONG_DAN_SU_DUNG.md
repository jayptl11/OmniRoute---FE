# 📘 Hướng Dẫn Sử Dụng OmniRoute

> **OmniRoute** là hệ thống quản lý và phân luồng lead thông minh, hỗ trợ 9 vai trò (role) khác nhau trong tổ chức bán hàng, từ tiếp nhận khách hàng đến quản lý cấp cao.

---

## 📋 Mục Lục

| Role | Tên đầy đủ | Đường dẫn |
|------|-----------|-----------|
| [QT](#1-qt--quản-trị-hệ-thống) | Quản trị hệ thống | `/admin` |
| [TV](#2-tv--tư-vấn-viên) | Tư vấn viên | `/tv` |
| [SA](#3-sa--nhân-viên-bán-hàng) | Nhân viên bán hàng (Sales Agent) | `/sa` |
| [DP](#4-dp--điều-phối-viên) | Điều phối viên (Dispatcher) | `/dp` |
| [CS](#5-cs--chăm-sóc-khách-hàng) | Chăm sóc khách hàng | `/cs` |
| [TN](#6-tn--trưởng-nhóm) | Trưởng nhóm (Team Lead) | `/tn` |
| [QL](#7-ql--quản-lý-cửa-hàng) | Quản lý cửa hàng (Store Manager) | `/ql` |
| [BQL](#8-bql--ban-quản-lý-lãnh-đạo) | Ban Quản lý / Lãnh đạo | `/bql` |
| [SS](#9-ss--nhân-viên-bán-hàng-cấp-cao) | Senior Sales (Nhân viên bán hàng cấp cao) | `/sa` |

---

## 🔐 Đăng Nhập Chung

1. Truy cập địa chỉ web của hệ thống.
2. Nhập **Username** và **Mật khẩu** được cấp bởi Admin.
3. Nhấn **Đăng nhập**.
4. Nếu tài khoản mới, hệ thống có thể yêu cầu xác thực OTP qua email.
5. Hệ thống tự động chuyển hướng tới giao diện phù hợp với vai trò của bạn.

> **Lưu ý:** Nếu quên mật khẩu, nhấn **"Quên mật khẩu"** trên trang đăng nhập và làm theo hướng dẫn qua email.

---

## 1. QT — Quản Trị Hệ Thống

> **Dành cho:** Admin/Quản trị viên hệ thống. Có quyền cao nhất, quản lý toàn bộ cấu hình và tài khoản.

### Các trang chức năng

#### 👥 Tài khoản (`/admin/users`)
- **Xem danh sách** tất cả tài khoản trong hệ thống (có phân trang, 20 tài khoản/trang).
- **Tìm kiếm** theo username hoặc email bằng thanh tìm kiếm.
- **Lọc** theo role hoặc trạng thái (Hoạt động / Đã khóa).
- **Tạo tài khoản mới**: nhấn nút **"Tạo tài khoản"** → điền thông tin → lưu.
- **Chỉnh sửa** thông tin tài khoản: nhấn icon ✏️ trên dòng cần sửa.
- **Reset mật khẩu** cho user: nhấn icon 🔑 trên dòng tương ứng.
- **Khóa / Mở khóa** tài khoản: nhấn icon 🔒/🔓.
  > ⚠️ Nếu tài khoản có lead chưa xử lý, hệ thống sẽ cảnh báo trước khi khóa.

#### 🔀 Luật phân luồng (`/admin/routing-rules`)
- Xem và cấu hình các luật điều phối lead tự động (Rule-based routing).
- Thêm/Sửa/Xóa các quy tắc phân công.

#### 🗂️ Dữ liệu danh mục (`/admin/master-data`)
- Quản lý các dữ liệu nền tảng: loại nhu cầu, kênh tiếp nhận, v.v.

#### 🏪 Cửa hàng (`/admin/stores`)
- Xem và quản lý danh sách cửa hàng/đơn vị trong hệ thống.
- Thêm/Sửa thông tin cửa hàng (tên, mã, địa chỉ, vùng).

#### 🧑‍🤝‍🧑 Nhóm (`/admin/teams`)
- Quản lý cấu hình nhóm (team): tên nhóm, thành viên, nhóm trưởng.

#### ⏱️ Cấu hình SLA (`/admin/sla-config`)
- Thiết lập thời hạn SLA cho từng loại lead/ticket.
- Cấu hình ngưỡng cảnh báo vi phạm SLA.

#### 🔔 Cấu hình thông báo (`/admin/notification-configs`)
- Quản lý các kênh và mẫu thông báo tự động (email, push notification).

#### 📋 Nhật ký hệ thống (`/admin/audit-logs`)
- Xem toàn bộ lịch sử thao tác trên hệ thống: ai đã làm gì, lúc nào.
- Hỗ trợ lọc theo thời gian, người dùng, loại hành động.

#### 📊 Thống kê hệ thống (`/admin/system-stats`)
- Xem các số liệu tổng quan về hiệu suất hệ thống.

#### 🤖 AI API Keys (`/admin/ai-api-keys`)
- Quản lý các API key cho engine AI phân luồng.
- Thêm/Cập nhật/Vô hiệu hóa key.

---

## 2. TV — Tư Vấn Viên

> **Dành cho:** Nhân viên tuyến đầu tiếp nhận và tạo lead từ khách hàng liên hệ.

### Các trang chức năng

#### 📋 Danh sách Lead (`/tv/leads`)

Giao diện chia thành **2 phần**:

**Phần trái — Form tạo lead mới:**
1. Điền **Tên khách hàng** *(bắt buộc)*.
2. Điền **Số điện thoại** 10 chữ số, bắt đầu bằng 0 *(bắt buộc)*.
   - Hệ thống tự động kiểm tra **trùng số điện thoại** sau khi bạn rời khỏi ô nhập. Nếu trùng, sẽ hiện thông báo lead cũ tương ứng.
3. Chọn **Kênh tiếp nhận** *(bắt buộc)*: Facebook, Zalo, Hotline, v.v.
4. Nhập **Mô tả nhu cầu** *(bắt buộc, tối thiểu 10 ký tự)*.
5. *(Tuỳ chọn)* Nhập **Địa chỉ** (có gợi ý Google Maps) và **Email**.
6. *(Tuỳ chọn)* Thêm **Sản phẩm quan tâm**: nhập tên sản phẩm → nhấn Enter hoặc nút "Thêm".
7. Nhấn **"Tạo lead"** để hoàn thành.
   - Nếu số điện thoại trùng với lead đang tồn tại, hệ thống hỏi bạn muốn **xem lead cũ** hay **tạo lead mới**.

**Phần phải — Danh sách lead:**
- Xem toàn bộ lead của mình (20 lead/trang).
- **Tìm kiếm** theo số điện thoại hoặc tên khách hàng.
- **Lọc** theo trạng thái, kênh tiếp nhận, hoặc khoảng thời gian.
- Nhấn vào một dòng để xem chi tiết lead.

#### 📄 Chi tiết Lead (`/tv/leads/:id`)
- Xem toàn bộ thông tin lead: thông tin khách hàng, trạng thái, lịch sử xử lý.
- Cập nhật thêm thông tin nếu cần.

---

## 3. SA — Nhân Viên Bán Hàng

> **Dành cho:** Sales Agent nhận lead từ hệ thống và trực tiếp tư vấn, chốt sale.

### Các trang chức năng

#### 📋 Danh sách Lead (`/sa/leads`)
- Xem danh sách lead đã được phân công cho bản thân.
- **Tìm kiếm** theo tên, số điện thoại.
- **Lọc** theo trạng thái, ngày tạo.
- Nhấn vào lead để mở chi tiết và xử lý.

#### 📄 Chi tiết Lead (`/sa/leads/:id`)
- Xem đầy đủ thông tin khách hàng và lịch sử tương tác.
- Cập nhật **trạng thái lead** (Đang liên hệ → Đang tư vấn → Thắng/Thua).
- Ghi chú kết quả tư vấn.
- Thực hiện **Escalate** nếu cần sự hỗ trợ từ cấp trên.

#### 📅 Lịch nhắc (`/sa/follow-ups`)
- Xem danh sách các lead cần liên hệ lại theo lịch hẹn.
- Các lead được sắp xếp theo thứ tự ưu tiên và thời gian hẹn.

#### 📊 Hiệu suất cá nhân (`/sa/performance`)
- Xem thống kê hiệu suất bản thân: số lead xử lý, tỉ lệ chốt, tuân thủ SLA.
- So sánh với mục tiêu đặt ra.

---

## 4. DP — Điều Phối Viên

> **Dành cho:** Dispatcher phụ trách phân công lead thủ công tới đúng nhân viên/đơn vị.

### Các trang chức năng

#### 🗂️ Hàng đợi phân công (`/dp/queue`)
- Xem danh sách lead đang chờ được điều phối (trạng thái **Chờ điều phối**).
- **Lọc** theo:
  - Tên hoặc số điện thoại khách hàng.
  - Mức ưu tiên (High / Medium / Low).
  - Khu vực địa lý.
  - Thời gian chờ (ví dụ: chờ hơn 30 phút).
- Nhấn **"Tìm kiếm"** để áp dụng bộ lọc, **"Đặt lại"** để xoá lọc.
- Dòng màu đỏ = lead ưu tiên **High**, màu vàng = **Medium**.
- Nhấn nút **"Phân công"** để mở trang xử lý lead đó.

#### 📄 Chi tiết phân công (`/dp/queue/:id`)
- Xem đầy đủ thông tin lead cần điều phối.
- Chọn **nhân viên/đơn vị** phù hợp để gán lead.
- Xác nhận phân công.

#### 📜 Lịch sử điều phối (`/dp/history`)
- Xem toàn bộ lịch sử các lần phân công đã thực hiện.
- Lọc theo thời gian, kết quả phân công.

---

## 5. CS — Chăm Sóc Khách Hàng

> **Dành cho:** Nhân viên CSKH xử lý ticket hỗ trợ sau bán hàng.

### Các trang chức năng

#### 🎫 Danh sách Ticket (`/cs/tickets`)
- Xem danh sách ticket được gán cho bạn, **sắp xếp theo mức ưu tiên và SLA**.
- **Tìm kiếm** theo tên khách hàng, số điện thoại, hoặc mã ticket.
- **Lọc** theo:
  - Trạng thái: Mới / Đang xử lý / Chờ khách hàng / Escalated / Đã giải quyết / Đóng.
  - Mức ưu tiên: Cao / Trung bình / Thấp.
  - Khoảng ngày được gán.
- Các dòng được tô màu cảnh báo:
  - 🔴 Đỏ: đã vi phạm SLA.
  - 🟡 Vàng: ticket ưu tiên High.
  - 🟠 Cam: ticket ưu tiên Medium.
- Cột **SLA Deadline** hiển thị:
  - ⚠️ **Vi phạm SLA**: đã quá hạn.
  - 🕐 **Sắp đến hạn**: còn dưới 30 phút.
  - Ngày giờ cụ thể: còn nhiều thời gian.

#### 📄 Chi tiết Ticket (`/cs/tickets/:id`)
- Xem thông tin khách hàng, lịch sử tương tác, ghi chú trước đó.
- Cập nhật **trạng thái ticket**.
- Thêm ghi chú xử lý.
- Chuyển sang trạng thái **Chờ khách hàng** nếu cần thêm thông tin.
- **Escalate** ticket nếu vượt quá phạm vi xử lý.
- Đánh dấu **Đã giải quyết** / **Đóng ticket**.

#### 📊 Hiệu suất (`/cs/performance`)
- Xem thống kê cá nhân: số ticket xử lý, thời gian xử lý trung bình, tỉ lệ giải quyết, SLA.

---

## 6. TN — Trưởng Nhóm

> **Dành cho:** Team Lead quản lý nhóm nhân viên SA/CS và theo dõi hiệu suất đội.

### Các trang chức năng

#### 🏠 Tổng quan đội (`/tn/overview`)
Màn hình chính của TN với 4 thẻ thống kê nhanh:
- **Chờ phản hồi**: số lead đang chờ SA phản hồi → nhấn để xem danh sách.
- **Đang xử lý**: số lead đang được tư vấn → nhấn để xem danh sách.
- **Vi phạm SLA**: số lead đã vi phạm SLA → nhấn để chuyển tới trang SLA.
- **Sắp vi phạm SLA**: số lead sắp đến hạn → nhấn để xem.

Biểu đồ đường **xu hướng lead 7 ngày gần nhất** giúp theo dõi lượng lead biến động theo thời gian.

Các phím tắt nhanh (Quick Links):
- **Toàn bộ leads**: xem tất cả lead của đội.
- **Báo cáo đội**: xem báo cáo hiệu suất nhóm.
- **Quản lý đội**: quản lý thành viên.
- **Lịch sử escalate**: xem các lead đã được escalate.

#### ⚠️ Vi phạm SLA (`/tn/sla`)
- Danh sách lead đang vi phạm hoặc sắp vi phạm SLA.
- Theo dõi và can thiệp kịp thời (nhắc nhân viên, reassign).

#### 📋 Lead của đội (`/tn/leads`)
- Xem toàn bộ lead được phân công cho các thành viên trong nhóm.
- Lọc theo trạng thái, nhân viên phụ trách.
- Can thiệp reassign nếu cần.

#### 📊 Báo cáo đội (`/tn/report`)
- Thống kê hiệu suất nhóm theo thời gian: số lead, tỉ lệ thắng, thời gian xử lý.

#### 📜 Lịch sử escalate (`/tn/escalate-history`)
- Xem lịch sử tất cả các lead đã được escalate trong nhóm.

#### 👥 Quản lý đội (`/tn/team`)
- Xem danh sách thành viên trong nhóm, trạng thái và workload hiện tại.
- Nhấn vào thành viên để xem hiệu suất chi tiết.

#### 📈 Hiệu suất thành viên (`/tn/team/:userId/performance`)
- Xem chi tiết hiệu suất cá nhân của từng nhân viên trong nhóm.
- Số lead xử lý, tỉ lệ chốt, SLA tuân thủ.

---

## 7. QL — Quản Lý Cửa Hàng

> **Dành cho:** Store Manager quản lý hoạt động của một cửa hàng/đơn vị kinh doanh.

### Các trang chức năng

#### 🏪 Tổng quan đơn vị (`/ql/dashboard`)
Màn hình chính hiển thị:
- **Widget năng lực**: tên cửa hàng, số lead đang active, số slot còn trống, tối đa cho phép.
  - 🔴 Cảnh báo **"Quá tải"**: khi vượt ngưỡng tối đa.
  - 🟡 Cảnh báo **"Gần đầy"**: khi còn ít slot trống.
  - Thanh tiến trình hiển thị phần trăm sử dụng capacity.
- **Bảng workload nhân sự**: danh sách nhân viên (SA, CS, DP) với số lead active, vi phạm SLA, đã hoàn thành và trạng thái hoạt động.

#### 📋 Lead đơn vị (`/ql/leads`)
- Xem tất cả lead thuộc cửa hàng mình quản lý.
- Lọc theo trạng thái, nhân viên, kênh.

#### 👥 Thành viên (`/ql/members`)
- Quản lý danh sách nhân viên trong cửa hàng.
- Xem trạng thái, workload của từng người.

#### 📜 Lịch sử (`/ql/history`)
- Xem lịch sử xử lý lead của đơn vị.

#### 📊 Báo cáo (`/ql/report`)
- Báo cáo hiệu suất đơn vị: tổng lead, tỉ lệ thắng, SLA, so sánh theo kỳ.

---

## 8. BQL — Ban Quản Lý / Lãnh Đạo

> **Dành cho:** Cấp lãnh đạo xem báo cáo tổng hợp toàn bộ hệ thống.

### Các trang chức năng

#### 📊 Dashboard lãnh đạo (`/bql/dashboard`)

**Bộ lọc thời gian** ở góc trên phải: **Tuần này / Tháng này / Quý này**.

**Thẻ KPI tổng quan (6 thẻ):**
| KPI | Ý nghĩa |
|-----|---------|
| Lead hôm nay | Tổng số lead phát sinh trong ngày |
| Lead tuần này | Tổng lead trong tuần hiện tại |
| Lead tháng này | Tổng lead trong tháng hiện tại |
| SLA đạt | Tỉ lệ % lead/ticket xử lý đúng hạn SLA |
| Win Rate | Tỉ lệ % lead chốt thành công |
| Vi phạm SLA | Số lead/ticket hiện đang vi phạm SLA |

**Biểu đồ phân tích:**
- **Xu hướng lead theo ngày**: biểu đồ đường hiển thị số lead theo từng ngày.
- **Leads theo kênh**: biểu đồ tròn phân chia tỉ lệ kênh (Facebook, Zalo, Hotline...).
- **Leads theo nhu cầu**: biểu đồ cột ngang phân chia theo loại nhu cầu khách hàng.

**Top 5 cửa hàng**: xếp hạng các đơn vị theo số lượng lead.

**KPI phân luồng:**
- Rule Match Rate: tỉ lệ lead được phân luồng tự động bằng rule.
- Thời gian gán trung bình: thời gian từ khi có lead đến khi gán cho nhân viên.
- SLA đạt: tỉ lệ tuân thủ SLA.
- Escalation Rate: tỉ lệ lead phải escalate lên cấp cao.
- Hiển thị xu hướng so với kỳ trước (↑/↓).

**SLA theo cửa hàng**: bảng hiệu suất SLA từng đơn vị, màu sắc theo mức:
- 🟢 Xanh: ≥ 90% (tốt)
- 🟡 Vàng: 75–89% (cần cải thiện)
- 🔴 Đỏ: < 75% (cảnh báo)

**Xuất báo cáo:**
- Nhấn nút **"Xuất báo cáo"** → chọn định dạng **Excel** hoặc **PDF**.
- Chọn loại báo cáo: Tổng quan / So sánh đơn vị / Báo cáo bán hàng.

#### 🔍 Drill-down (`/bql/drill-down`)
- Đào sâu vào dữ liệu của từng đơn vị/nhóm cụ thể.

#### ⚖️ So sánh đơn vị (`/bql/unit-comparison`)
- So sánh hiệu suất giữa các cửa hàng/đơn vị theo nhiều chỉ số.

#### 📈 Báo cáo bán hàng (`/bql/sales-report`)
- Báo cáo chi tiết về hoạt động bán hàng toàn hệ thống.

---

## 9. SS — Senior Sales (Nhân Viên Bán Hàng Cấp Cao)

> **Dành cho:** Nhân viên bán hàng cấp cao với quyền xử lý lead tương tự SA, thường được phân công các lead phức tạp hoặc giá trị cao.

> **Giao diện SS giống với SA** — truy cập qua đường dẫn `/sa`. Xem [hướng dẫn SA](#3-sa--nhân-viên-bán-hàng) để biết chi tiết các tính năng.

---

## 💡 Các Tính Năng Chung

### Trạng thái Lead
| Trạng thái | Ý nghĩa |
|-----------|---------|
| Mới | Lead vừa được tạo, chưa xử lý |
| Chờ điều phối | Đang chờ DP phân công |
| Đã phân công | Đã gán cho SA/SS |
| Đang liên hệ | SA đang liên hệ khách |
| Đang xử lý | Đang trong quá trình tư vấn |
| Thắng (Won) | Chốt thành công |
| Thua (Lost) | Không thành công |
| Hủy (Cancelled) | Lead bị hủy |

### Mức độ ưu tiên Lead
| Mức | Màu | Ý nghĩa |
|-----|-----|---------|
| High | 🔴 Đỏ | Cần xử lý ngay |
| Medium | 🟡 Vàng | Ưu tiên bình thường |
| Low | ⬜ Trắng | Không khẩn cấp |

### Tính năng SLA
- **SLA (Service Level Agreement)**: thời hạn quy định cần xử lý lead/ticket.
- Khi sắp đến hạn (< 30 phút): hiển thị cảnh báo **"Sắp đến hạn"**.
- Khi đã quá hạn: hiển thị cảnh báo **"Vi phạm SLA"** màu đỏ.

### Thông báo Real-time
- Hệ thống gửi thông báo real-time qua **SignalR** khi có lead mới được phân công, cập nhật trạng thái, hoặc sắp vi phạm SLA.

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề kỹ thuật hoặc cần hỗ trợ, vui lòng liên hệ:
- **Quản trị hệ thống (QT)** để được cấp lại mật khẩu hoặc giải quyết vấn đề tài khoản.
- **Trưởng nhóm (TN)** hoặc **Quản lý cửa hàng (QL)** để được hỗ trợ nghiệp vụ.

---

*Tài liệu này được cập nhật theo phiên bản hiện tại của OmniRoute FE.*
