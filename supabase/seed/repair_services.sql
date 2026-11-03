-- Mobile repair offerings. Inserted INACTIVE with no prices: nothing is shown to customers or bookable until you
-- enable it. Until an admin screen exists, edit in the Supabase SQL editor, e.g.:
--   update repair_services set active = true, doorstep_available = true, starting_price = 0 /* your real price */,
--     est_duration_text = '' /* your real estimate */ where slug = 'screen-replacement';
--   insert into repair_service_areas (pincode, city, doorstep, pickup) values ('400001', 'Mumbai', true, false);
--   insert into repair_slots (starts_at, ends_at, fulfilment, capacity) values ('2026-12-01 10:00+05:30', '2026-12-01 12:00+05:30', 'doorstep', 2);
--   insert into device_models (device_type, manufacturer, series, model) values ('mobile', 'Samsung', 'Galaxy A', 'A34');
insert into repair_services (slug, device_type, name, description, category, icon_key, sort_order) values
  ('screen-replacement', 'mobile', 'Screen replacement', 'Cracked glass, dead touch, lines or a dark display.', 'common', 'screen', 1),
  ('battery-replacement', 'mobile', 'Battery replacement', 'Fast draining, swollen or shutting down at random.', 'common', 'battery', 2),
  ('charging-port-repair', 'mobile', 'Charging port repair', 'Loose, dirty or not charging reliably.', 'common', 'port', 3),
  ('back-glass-replacement', 'mobile', 'Back glass replacement', 'Cracked or shattered rear panel.', 'common', 'back', 4),
  ('software-troubleshooting', 'mobile', 'Software troubleshooting', 'Hangs, boot loops, storage and update problems.', 'common', 'software', 5),
  ('camera-repair', 'mobile', 'Camera repair', 'Blurry, black or cracked camera modules.', 'advanced', 'camera', 6),
  ('speaker-mic-repair', 'mobile', 'Speaker & microphone repair', 'Muffled calls, no sound or crackling audio.', 'advanced', 'speaker', 7),
  ('water-damage-diagnosis', 'mobile', 'Water damage diagnosis', 'Assessment after liquid exposure. Do not charge the phone.', 'advanced', 'water', 8),
  ('power-motherboard', 'mobile', 'Power & motherboard issues', 'Won''t switch on, no display or short-circuit symptoms.', 'advanced', 'board', 9),
  ('other-hardware', 'mobile', 'Other hardware repairs', 'Buttons, vibration motor, sensors and anything else.', 'advanced', 'wrench', 10)
on conflict (slug) do nothing;
