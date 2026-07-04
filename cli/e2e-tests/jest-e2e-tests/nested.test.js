describe('Outer Suite', () => {
    test('parent test', () => {
        expect(true).toBe(true);
    });

    describe('Inner Suite', () => {
        test('inner test', () => {
            expect(true).toBe(true);
        });
    });
});
