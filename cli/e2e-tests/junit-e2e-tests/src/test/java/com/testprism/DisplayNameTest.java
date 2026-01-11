package com.testprism;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class DisplayNameTest {
    @Test
    @DisplayName(
            "This is a test with a custom display name that should appear in test reports"
    )
    void testSuccess() {
        assertTrue(true);
    }
}
