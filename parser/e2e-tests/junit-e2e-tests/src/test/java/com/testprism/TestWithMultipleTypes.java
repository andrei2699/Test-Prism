package com.testprism;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class TestWithMultipleTypes {
    @Test
    void successTest() {
        assertTrue(true);
    }

    @Test
    void failedTest() {
        fail();
    }

    @Test
    @Disabled("Skipping this test")
    void skippedTest() {
        assertTrue(true);
    }
}
