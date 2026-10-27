# Synthetic legacy backup fixture

`legacy-schema1.synthetic.json` is the original isolated acceptance browser export, copied into the test-fixture namespace for public version control. Its printers are `p1`, `p2`, `p3`, named `Review printer …`, at `ISOLATED TEST FIXTURE`. Serial numbers, repairs, readings, costs and maintenance are fictional. Embedded custom images are one-pixel test images. The stored acknowledgment is a test fixture, never a person's agreement.

P45 imports this original schema-1 dataset with the updated reader and compares every supported data array. It verifies preservation of legacy rows without fabricating missing snapshot fields. Do not replace this file with a personal browser export. The raw browser capture remains excluded from Git; this explicitly reviewed synthetic copy is intentional test data.

The native browser suite derives its initial fixture from this same file, retaining an archived applied Creator 5 v1.0.0 alongside a pending registry v2.0.0. Its generated setup file remains ignored. Each fresh context must be empty before setup; restoration uses the real application's file input. See [native verification](../../remediation-phase1/NATIVE-VERIFICATION.md).
