import importlib.util
import pathlib
import unittest

MODULE_PATH = pathlib.Path(__file__).with_name("google_ads_export.py")
spec = importlib.util.spec_from_file_location("google_ads_export", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class GoogleAdsExportTimestampTests(unittest.TestCase):
    def test_swiss_summer_time_is_explicit(self):
        self.assertEqual(
            module.format_google_ads_time("20.08.2026 11:22"),
            "2026-08-20 11:22:00+02:00",
        )

    def test_swiss_winter_time_is_explicit(self):
        self.assertEqual(
            module.format_google_ads_time("20.12.2026 11:22"),
            "2026-12-20 11:22:00+01:00",
        )

    def test_iso_timestamp_is_normalized_to_swiss_time(self):
        self.assertEqual(
            module.format_google_ads_time("2026-08-20T09:22:00+00:00"),
            "2026-08-20 11:22:00+02:00",
        )

    def test_invalid_or_empty_timestamp_is_rejected(self):
        self.assertEqual(module.format_google_ads_time(""), "")
        self.assertEqual(module.format_google_ads_time("not-a-date"), "")


if __name__ == "__main__":
    unittest.main()
