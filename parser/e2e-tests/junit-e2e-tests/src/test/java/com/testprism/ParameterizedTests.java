package com.testprism;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.fail;

public class ParameterizedTests {
    @ParameterizedTest
    @ValueSource(strings = {"one", "two", "three"})
    void testParameterized(String input) {
        if ("two".equals(input)) {
            fail("Intentional failure for input: " + input);
        }
    }
}
