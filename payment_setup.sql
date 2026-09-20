-- Chạy file này trong Supabase > SQL Editor > Run
insert into public.site_settings (key, value, updated_at)
values (
  'payment',
  jsonb_build_object(
    'bank_name', 'VPBank',
    'account_name', 'GIAP THI KIM OANH',
    'account_number', '99470868',
    'qr_url', 'payment-qr.jpg',
    'note', 'Vui lòng kiểm tra đúng tổng tiền trước khi chuyển khoản. Với sản phẩm Liên hệ báo giá, chờ Kim Flora xác nhận giá trước khi chuyển.'
  ),
  now()
)
on conflict (key) do update
set value = excluded.value,
    updated_at = now();
