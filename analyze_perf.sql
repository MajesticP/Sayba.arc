SELECT 'berita' as t, count(*) as rows FROM public.berita
UNION ALL SELECT 'informasi', count(*) FROM public.informasi
UNION ALL SELECT 'layanan', count(*) FROM public.layanan
UNION ALL SELECT 'layanan_depts', count(*) FROM public.layanan_depts
UNION ALL SELECT 'portfolio', count(*) FROM public.portfolio
UNION ALL SELECT 'promo_banner', count(*) FROM public.promo_banner
UNION ALL SELECT 'tim', count(*) FROM public.tim;

SELECT tablename, rowsecurity
FROM pg_tables WHERE schemaname = 'public'
ORDER BY tablename;
