from __future__ import annotations

import shutil
import tempfile
import unittest
from pathlib import Path
import sys

import yaml

CONCEPT_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = CONCEPT_ROOT.parents[1]
sys.path.insert(0, str(CONCEPT_ROOT))

from validate_concepts import validate_library  # noqa: E402


class ConceptValidationTests(unittest.TestCase):
    def clone_library(self) -> tuple[tempfile.TemporaryDirectory, Path]:
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name) / "concepts"
        shutil.copytree(CONCEPT_ROOT, root, ignore=shutil.ignore_patterns("__pycache__", "validation_report.md", "validator_run.txt", "test_run.txt"))
        return temp, root

    def validate(self, root: Path):
        return validate_library(
            root,
            inventory_path=PROJECT_ROOT / "docs" / "Organizational_Content_Inventory.md",
            schema_path=root / "schemas" / "concept.schema.json",
        )

    def test_canonical_library_passes(self):
        result = self.validate(CONCEPT_ROOT)
        self.assertEqual(result.errors, [], "\n".join(result.errors))

    def test_prerequisite_cycle_is_rejected(self):
        temp, root = self.clone_library()
        self.addCleanup(temp.cleanup)
        path = root / "metadata" / "dma.yaml"
        data = yaml.safe_load(path.read_text())
        data["relationships"] = {"prerequisites": ["rdma"]}
        path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")
        result = self.validate(root)
        self.assertTrue(any("prerequisite cycle" in e for e in result.errors), result.errors)

    def test_missing_content_file_is_rejected(self):
        temp, root = self.clone_library()
        self.addCleanup(temp.cleanup)
        (root / "content" / "latency.md").unlink()
        result = self.validate(root)
        self.assertTrue(any("missing Markdown content file" in e or "lacks canonical Markdown pair" in e for e in result.errors), result.errors)

    def test_invalid_inventory_mapping_is_rejected(self):
        temp, root = self.clone_library()
        self.addCleanup(temp.cleanup)
        path = root / "metadata" / "latency.yaml"
        data = yaml.safe_load(path.read_text())
        data["inventory_mappings"][0]["item"] = "Not a Canonical Inventory Item"
        path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")
        result = self.validate(root)
        self.assertTrue(any("is not canonical" in e for e in result.errors), result.errors)

    def test_filename_mismatch_is_rejected(self):
        temp, root = self.clone_library()
        self.addCleanup(temp.cleanup)
        source = root / "metadata" / "latency.yaml"
        source.rename(root / "metadata" / "latency-copy.yaml")
        result = self.validate(root)
        self.assertTrue(any("filename must be latency.yaml" in e for e in result.errors), result.errors)

    def test_orphan_markdown_is_rejected(self):
        temp, root = self.clone_library()
        self.addCleanup(temp.cleanup)
        (root / "content" / "orphan.md").write_text("# Orphan\n\n## Overview\n\nThis is deliberately orphaned.\n", encoding="utf-8")
        result = self.validate(root)
        self.assertTrue(any("orphan Markdown" in e for e in result.errors), result.errors)

    def test_self_relationship_is_rejected(self):
        temp, root = self.clone_library()
        self.addCleanup(temp.cleanup)
        path = root / "metadata" / "rdma.yaml"
        data = yaml.safe_load(path.read_text())
        data["relationships"]["related"] = ["rdma"]
        path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")
        result = self.validate(root)
        self.assertTrue(any("must not reference itself" in e for e in result.errors), result.errors)

    def test_invalid_concept_kind_is_rejected_by_schema(self):
        temp, root = self.clone_library()
        self.addCleanup(temp.cleanup)
        path = root / "metadata" / "hbm.yaml"
        data = yaml.safe_load(path.read_text())
        data["concept_kind"] = "hardware"
        path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")
        result = self.validate(root)
        self.assertTrue(any("schema:" in e and "concept_kind" in e for e in result.errors), result.errors)


if __name__ == "__main__":
    unittest.main()
