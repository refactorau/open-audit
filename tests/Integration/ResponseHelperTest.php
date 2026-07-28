<?php

declare(strict_types=1);

namespace OpenAuditTest\Integration;

use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;

/**
 * response_get_sort() validates field names against the live schema via
 * db->tableExists() / db->fieldExists(), so these tests require a database.
 */
final class ResponseHelperTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate = false;

    protected function setUp(): void
    {
        parent::setUp();

        helper('response');
    }

    public function testValidSingleField(): void
    {
        $this->assertSame('users.name', response_get_sort('users', 'name'));
    }

    public function testDescendingField(): void
    {
        $this->assertSame('users.email DESC', response_get_sort('users', '-email'));
    }

    public function testMultipleFields(): void
    {
        $this->assertSame('users.name, users.email DESC', response_get_sort('users', 'name,-email'));
    }

    public function testDotNotation(): void
    {
        $this->assertSame('devices.last_seen', response_get_sort('ignored', 'devices.last_seen'));
    }

    public function testInvalidField(): void
    {
        $this->assertSame('', response_get_sort('users', 'invalid'));
    }

    public function testMixedValidAndInvalid(): void
    {
        $this->assertSame('users.name, users.email DESC', response_get_sort('users', 'name,invalid,-email'));
    }

    public function testEmptyInput(): void
    {
        $this->assertSame('', response_get_sort('users', ''));
    }
}
