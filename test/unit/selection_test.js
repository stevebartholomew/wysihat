new Test.Unit.Runner({
  setup: function() {
    $('content').update(
      "<strong id=\"lorem\">Lorem ipsum</strong> dolor sit amet, " +
      "<em id=\"consectetuer\">consectetuer</em> adipiscing elit."
    );

    this.selection = window.getSelection();
  },

  testAddRange: function() {
    var runner = this;

    if (!this.selection.addRange) {
      runner.flunk("addRange is not implemented");
      return false;
    }

    var range = document.createRange();
    range.selectNode($('consectetuer'));
    this.selection.addRange(range);

    runner.assertEqual($('content'), this.selection.anchorNode, "anchorNode");
    runner.assertEqual(2, this.selection.anchorOffset, "anchorOffset");
    runner.assertEqual($('content'), this.selection.focusNode, "focusNode");
    runner.assertEqual(3, this.selection.focusOffset, "focusOffset");
    runner.assertEqual(false, this.selection.isCollapsed, "isCollapsed");
    runner.assertEqual(1, this.selection.rangeCount, "rangeCount");
  },

  testCollapse: function() {
    var runner = this;

    if (!this.selection.collapse) {
      runner.flunk("collapse is not implemented");
      return false;
    }

    this.selection.collapse($('content'), 0)

    runner.assertEqual($('content'), this.selection.anchorNode, "anchorNode");
    runner.assertEqual(0, this.selection.anchorOffset, "anchorOffset");
    runner.assertEqual($('content'), this.selection.focusNode, "focusNode");
    runner.assertEqual(0, this.selection.focusOffset, "focusOffset");
    runner.assertEqual(true, this.selection.isCollapsed, "isCollapsed");
    runner.assertEqual(1, this.selection.rangeCount, "rangeCount");
  },

  testCollapseToStart: function() {
    var runner = this;

    if (!this.selection.collapseToStart) {
      runner.flunk("collapseToStart is not implemented");
      return false;
    }

    this.selection.collapseToStart()

    runner.assertEqual($('content'), this.selection.anchorNode, "anchorNode");
    runner.assertEqual(0, this.selection.anchorOffset, "anchorOffset");
    runner.assertEqual($('content'), this.selection.focusNode, "focusNode");
    runner.assertEqual(0, this.selection.focusOffset, "focusOffset");
    runner.assertEqual(true, this.selection.isCollapsed, "isCollapsed");
    runner.assertEqual(1, this.selection.rangeCount, "rangeCount");
  },

  testCollapseToEnd: function() {
    var runner = this;

    if (!this.selection.collapseToEnd) {
      runner.flunk("collapseToEnd is not implemented");
      return false;
    }

    this.selection.collapseToEnd()

    runner.assertEqual($('content'), this.selection.anchorNode, "anchorNode");
    runner.assertEqual(0, this.selection.anchorOffset, "anchorOffset");
    runner.assertEqual($('content'), this.selection.focusNode, "focusNode");
    runner.assertEqual(0, this.selection.focusOffset, "focusOffset");
    runner.assertEqual(true, this.selection.isCollapsed, "isCollapsed");
    runner.assertEqual(1, this.selection.rangeCount, "rangeCount");
  },

  testGetRangeAt: function() {
    var runner = this;

    if (!this.selection.getRangeAt) {
      runner.flunk("getRangeAt is not implemented");
      return false;
    }

    var range = this.selection.getRangeAt(0);

    runner.assertEqual(Node.ELEMENT_NODE, range.startContainer.nodeType, "startContainer.nodeType");
    runner.assertEqual("DIV", range.startContainer.tagName, "startContainer.tagName");
    runner.assertEqual(0, range.startOffset, "startOffset");
    runner.assertEqual(Node.ELEMENT_NODE, range.endContainer.nodeType, "endContainer.nodeType");
    runner.assertEqual("DIV", range.endContainer.tagName, "endContainer.tagName");
    runner.assertEqual(0, range.endOffset, "endOffset");
    runner.assertEqual(true, range.collapsed, "collapsed");
    runner.assertEqual($('content'), range.commonAncestorContainer, "commonAncestorContainer")
  },

  testRemoveAllRanges: function() {
    var runner = this;

    if (!this.selection.removeAllRanges) {
      runner.flunk("removeAllRanges is not implemented");
      return false;
    }

    this.selection.removeAllRanges()

    runner.assertEqual(null, this.selection.anchorNode, "anchorNode");
    runner.assertEqual(0, this.selection.anchorOffset, "anchorOffset");
    runner.assertEqual(null, this.selection.focusNode, "focusNode");
    runner.assertEqual(0, this.selection.focusOffset, "focusOffset");
    runner.assertEqual(true, this.selection.isCollapsed, "isCollapsed");
    runner.assertEqual(0, this.selection.rangeCount, "rangeCount");
  }
});
