const INVOICE_START_PATTERN =
  /-{3,}|(?:tên\s+người\s+mua|thông\s+tin\s+xuất\s+hóa\s+đơn|xuất\s+hóa\s+đơn|mã\s+số\s+thuế|chủ\s+hộ)\s*:/iu;

const PHONE_PATTERN =
  /(?:\+84[\s.-]?(?:\d[\s.-]?){9}|0\d{9})/u;

// Nhận diện đầu dòng sản phẩm theo số lượng + tên hàng.
// Đây là danh sách từ khóa có thể bổ sung theo dữ liệu thực tế.
const PRODUCT_START_PATTERN =
  /\s+\d{1,3}\s+(?=(?:nước\s+sốt|nước\s+cốt|chả\s+cá|bánh\s+gạo|bột|miến|gạo|sốt|tương|ớt|rong\s+biển|mì|kg\b|thùng\b|gói\b))/iu;

const ADDRESS_START_PATTERN =
  /\b\d{1,5}(?:\/\d+[A-Za-z]?)?[A-Za-z]?\s+[\p{L}]/u;

export function extractDeliveryAddressFromMessage(
  content: string,
): string | null {
  // 1. Loại bỏ phần thông tin hóa đơn phía sau.
  const invoiceStart = content.search(INVOICE_START_PATTERN);

  const deliverySection =
    invoiceStart >= 0
      ? content.slice(0, invoiceStart)
      : content;

  // 2. Tìm số điện thoại trong phần giao hàng.
  const phone = PHONE_PATTERN.exec(deliverySection);

  if (!phone) return null;

  // 3. Lấy nội dung sau số điện thoại.
  let candidate = deliverySection.slice(
    phone.index + phone[0].length,
  ).trim();

  // 4. Tìm vị trí bắt đầu số nhà.
  const addressStart = ADDRESS_START_PATTERN.exec(candidate);

  if (!addressStart) return null;

  candidate = candidate.slice(addressStart.index);

  // 5. Cắt trước danh sách sản phẩm.
  const productStart = candidate.search(PRODUCT_START_PATTERN);

  if (productStart >= 0) {
    candidate = candidate.slice(0, productStart);
  }

  // 6. Dọn khoảng trắng và dấu phân cách.
  candidate = candidate
    .replace(/\s+/g, " ")
    .replace(/[\s,;.-]+$/g, "")
    .trim();

  return candidate || null;
}