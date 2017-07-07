USE poc_legacy;

UPDATE patients
SET address_1 = '2', address_2 = 'Rossington St', address_3 = 'Leeds', postcode = 'LS2 8HD', phone = '(0113) 222 4401', date_of_birth = DATE('1956-09-07')
WHERE id = 69;
