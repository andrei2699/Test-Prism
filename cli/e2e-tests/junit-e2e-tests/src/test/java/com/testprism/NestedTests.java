package com.testprism;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class NestedTests {
    @Test
    void parentTest() {
        assertTrue(true);
    }

    @Nested
    class InnerNestedTest {
        @Test
        void innerTest() {
            assertTrue(true);
        }
    }

    @Nested
    class DeeperNestedTest {
        @Nested
        class EvenDeeperNestedTest {
            @Test
            void deeperInnerTest() {
                assertTrue(true);
            }
        }
    }
}
